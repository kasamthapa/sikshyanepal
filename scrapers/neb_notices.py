"""
NEB Notices Scraper
Target: https://www.neb.gov.np
Extracts notices and exam schedules from the National Examinations Board.
Inserts into the `notices` table.
"""

import urllib3
import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://www.neb.gov.np"
NOTICE_URLS = [
    f"{BASE_URL}/notices",
    f"{BASE_URL}/notice",
    f"{BASE_URL}/news-and-notices",
    f"{BASE_URL}/",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SikshyaNepalBot/1.0; "
        "+https://sikshyanepal.vercel.app)"
    )
}


class NEBNoticesScraper(BaseScraper):
    def __init__(self):
        super().__init__("NEBNotices")

    def fetch_page(self, url: str) -> BeautifulSoup | None:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15, verify=False)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except Exception as e:
            self.logger.warning(f"Failed to fetch {url}: {e}")
            return None

    def parse_notices(self, soup: BeautifulSoup) -> list[dict]:
        items = []
        seen: set[str] = set()

        # Strategy 1: table rows (NEB often uses a table layout)
        for row in soup.select("table.table tr, table tr"):
            cells = row.find_all("td")
            if len(cells) < 1:
                continue
            link_tag = row.find("a", href=True)
            if not link_tag:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 8 or title in seen:
                continue
            seen.add(title)

            href = link_tag["href"]
            if href.startswith("/"):
                href = BASE_URL + href
            elif not href.startswith("http"):
                href = BASE_URL + "/" + href.lstrip("/")

            date_str = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                if any(c.isdigit() for c in text) and len(text) < 20:
                    date_str = text
                    break

            items.append({"title": title, "notice_url": href, "date_raw": date_str})

        # Strategy 2: notice card divs
        if not items:
            selectors = [
                ".notice-list li", ".notices li", ".news-list li",
                "article", ".post-item", ".entry", ".card"
            ]
            for sel in selectors:
                for el in soup.select(sel):
                    link_tag = el.find("a", href=True)
                    if not link_tag:
                        continue
                    title = link_tag.get_text(strip=True)
                    if not title or len(title) < 8 or title in seen:
                        continue
                    seen.add(title)
                    href = link_tag["href"]
                    if href.startswith("/"):
                        href = BASE_URL + href
                    elif not href.startswith("http"):
                        href = BASE_URL + "/" + href.lstrip("/")
                    date_tag = el.find(["time", "span"])
                    date_str = date_tag.get_text(strip=True) if date_tag else ""
                    items.append({"title": title, "notice_url": href, "date_raw": date_str})
                if items:
                    break

        # Strategy 3: keyword-filtered anchors
        if not items:
            keywords = [
                "notice", "exam", "schedule", "result", "grade",
                "see", "neb", "class 11", "class 12", "application",
                "form", "scholarship", "hall ticket", "admit card",
            ]
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 10 or title in seen:
                    continue
                if any(kw in title.lower() for kw in keywords):
                    seen.add(title)
                    href = anchor["href"]
                    if href.startswith("/"):
                        href = BASE_URL + href
                    elif not href.startswith("http"):
                        href = BASE_URL + "/" + href.lstrip("/")
                    items.append({"title": title, "notice_url": href, "date_raw": ""})

        self.logger.info(f"Parsed {len(items)} NEB notices")
        return items

    def scrape(self) -> dict:
        # NEB is not a standard university — create it if missing
        university_id = self.get_university_id(
            "NEB", "National Examinations Board"
        )
        if not university_id:
            self.logger.error("Could not find/create NEB — aborting")
            return self.summary()

        soup = None
        items = []
        for url in NOTICE_URLS:
            self.logger.info(f"Trying {url}")
            soup = self.fetch_page(url)
            if soup:
                items = self.parse_notices(soup)
                if items:
                    break

        if not items:
            self.logger.warning("No notices found on any NEB URL")
            return self.summary()

        self.logger.info(f"Processing {len(items)} NEB notices")

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
                "notice_url": item.get("notice_url"),
                "published_date": date_str,
            }

            if self.insert_record("notices", record):
                self.send_notification(
                    title="New Notice 📋",
                    message=title,
                    url=f"https://sikshyanepal.vercel.app/notices/{record['slug']}",
                )

        return self.summary()


if __name__ == "__main__":
    scraper = NEBNoticesScraper()
    result = scraper.scrape()
    print(result)
