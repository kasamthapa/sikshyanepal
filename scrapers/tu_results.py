"""
TU Results Scraper
Target: https://www.tuexam.edu.np
Extracts exam results and inserts into the `results` table.
"""

import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

BASE_URL = "https://www.tuexam.edu.np"
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
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except Exception as e:
            self.logger.error(f"Failed to fetch {url}: {e}")
            return None

    def parse_results(self, soup: BeautifulSoup) -> list[dict]:
        """
        TU Exam site lists results as links/table rows.
        We try multiple selector strategies for resilience.
        """
        items = []

        # Strategy 1: table rows with links (most common layout)
        for row in soup.select("table tr"):
            cells = row.find_all("td")
            if len(cells) < 2:
                continue
            link_tag = row.find("a", href=True)
            if not link_tag:
                continue

            title = link_tag.get_text(strip=True)
            if not title or len(title) < 5:
                continue

            href = link_tag["href"]
            if not href.startswith("http"):
                href = BASE_URL + "/" + href.lstrip("/")

            # Try to extract a date from cells
            date_str = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                # Look for date-like patterns
                if any(c.isdigit() for c in text) and (
                    "-" in text or "/" in text or len(text) < 15
                ):
                    date_str = text
                    break

            items.append({
                "title": title,
                "result_url": href,
                "date_raw": date_str,
            })

        # Strategy 2: notice/announcement divs (alternate layout)
        if not items:
            for anchor in soup.select("div.notice a, ul.notice-list a, .result-list a, .news-list a"):
                title = anchor.get_text(strip=True)
                if not title or len(title) < 5:
                    continue
                href = anchor.get("href", "")
                if not href.startswith("http"):
                    href = BASE_URL + "/" + href.lstrip("/")
                items.append({"title": title, "result_url": href, "date_raw": ""})

        # Strategy 3: any anchor whose text looks like a result announcement
        if not items:
            keywords = ["result", "परीक्षाफल", "exam", "semester", "annual"]
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 8:
                    continue
                if any(kw in title.lower() for kw in keywords):
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

            self.insert_record("results", record)

        return self.summary()


if __name__ == "__main__":
    scraper = TUResultsScraper()
    result = scraper.scrape()
    print(result)
