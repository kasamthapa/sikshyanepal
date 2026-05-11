"""
TU Results Scraper
Target: https://www.tuexam.edu.np
Extracts exam results and inserts into the `results` table.
"""

import re
import urllib3
import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tuexam.edu.np"
RESULTS_URL = f"{BASE_URL}/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SikshyaNepalBot/1.0; "
        "+https://sikshyanepal.vercel.app)"
    )
}


class TUResultsScraper(BaseScraper):
    def __init__(self):
        super().__init__("TUResults")

    def fetch_page(self, url: str) -> BeautifulSoup | None:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15, verify=False)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except Exception as e:
            self.logger.error(f"Failed to fetch {url}: {e}")
            return None

    def parse_results(self, soup: BeautifulSoup) -> list[dict]:
        items = []
        seen: set[str] = set()

        # Strategy 1: tuexam.edu.np layout — .col-md-7 notice cards
        # Each item is a .col-md-4 with <p><b>title</b></p> + <a class="btn btn-primary" href="view-notice?...">
        for card in soup.select(".col-md-7 .col-md-4, .col-md-4"):
            b_tag = card.find("b")
            link_tag = card.find("a", class_="btn-primary") or card.find("a", href=lambda h: h and "view-notice" in h)
            if not b_tag or not link_tag:
                continue
            title = b_tag.get_text(strip=True)
            if not title or len(title) < 5 or title in seen:
                continue
            seen.add(title)
            href = link_tag["href"]
            if not href.startswith("http"):
                href = BASE_URL + "/" + href.lstrip("/")

            # Extract date from title e.g. "(Published Date: 2082/08/12)"
            date_match = re.search(r"[\(\[]*(?:Published Date|Date):\s*([\d/\-]+)", title, re.IGNORECASE)
            date_raw = date_match.group(1) if date_match else ""

            items.append({"title": title, "result_url": href, "date_raw": date_raw})

        # Strategy 2: table rows with links
        if not items:
            for row in soup.select("table tr"):
                cells = row.find_all("td")
                if len(cells) < 2:
                    continue
                link_tag = row.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 5 or title in seen:
                    continue
                seen.add(title)
                href = link_tag["href"]
                if not href.startswith("http"):
                    href = BASE_URL + "/" + href.lstrip("/")
                date_str = ""
                for cell in cells:
                    text = cell.get_text(strip=True)
                    if any(c.isdigit() for c in text) and ("-" in text or "/" in text):
                        date_str = text
                        break
                items.append({"title": title, "result_url": href, "date_raw": date_str})

        # Strategy 3: keyword-filtered anchors
        if not items:
            keywords = ["result", "परीक्षाफल", "exam", "semester", "annual", "schedule"]
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 8 or title in seen:
                    continue
                if any(kw in title.lower() for kw in keywords):
                    seen.add(title)
                    href = anchor["href"]
                    if not href.startswith("http"):
                        href = BASE_URL + "/" + href.lstrip("/")
                    items.append({"title": title, "result_url": href, "date_raw": ""})

        self.logger.info(f"Found {len(items)} result entries on page")
        return items

    def scrape(self) -> dict:
        self.logger.info(f"Scraping TU results from {RESULTS_URL}")

        university_id = self.get_university_id("TU")
        if not university_id:
            self.logger.error("TU university_id not found — aborting")
            return self.summary()

        soup = self.fetch_page(RESULTS_URL)
        if not soup:
            return self.summary()

        items = self.parse_results(soup)
        self.logger.info(f"Processing {len(items)} entries")

        for item in items:
            title = item["title"].strip()
            if not title:
                continue

            date_str = self.parse_date(item["date_raw"]) if item["date_raw"] else None
            slug = self.slugify_with_date(title, item.get("date_raw", ""))

            record = {
                "title": title,
                "slug": slug,
                "university_id": university_id,
                "result_url": item.get("result_url"),
                "published_date": date_str,
            }

            # Try to extract program/semester from title
            title_lower = title.lower()
            for prog in ["bsc csit", "bca", "bba", "bbs", "ba", "bsc", "be", "mbbs", "mba"]:
                if prog in title_lower:
                    record["program"] = prog.upper()
                    break
            for sem in ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]:
                if sem in title_lower:
                    record["semester"] = f"{sem} Semester"
                    break

            if self.insert_record("results", record):
                self.send_notification(
                    title="New Result Published 📢",
                    message=f"{title} is now available",
                    url=f"https://sikshyanepal.vercel.app/results/{record['slug']}",
                )

        return self.summary()


if __name__ == "__main__":
    scraper = TUResultsScraper()
    result = scraper.scrape()
    print(result)
