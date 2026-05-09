"""
TU Notices Scraper
Target: https://tribhuvan-university.edu.np/notices
Extracts notices and inserts into the `notices` table.
"""

import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper

BASE_URL = "https://tribhuvan-university.edu.np"
NOTICES_URLS = [
    f"{BASE_URL}/notices",
    f"{BASE_URL}/notice",
    f"{BASE_URL}/",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SikshyaNepalBot/1.0; "
        "+https://sikshyanepal.vercel.app)"
    )
}


class TUNoticesScraper(BaseScraper):
    def __init__(self):
        super().__init__("TUNotices")

    def fetch_page(self, url: str) -> BeautifulSoup | None:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except Exception as e:
            self.logger.warning(f"Failed to fetch {url}: {e}")
            return None

    def parse_notices(self, soup: BeautifulSoup, base: str) -> list[dict]:
        items = []
        seen_titles: set[str] = set()

        # Strategy 1: common notice/announcement table patterns
        for row in soup.select("table tr, .notice-list li, .announcement-list li"):
            link_tag = row.find("a", href=True)
            if not link_tag:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 8 or title in seen_titles:
                continue
            seen_titles.add(title)

            href = link_tag["href"]
            if href.startswith("/"):
                href = base + href
            elif not href.startswith("http"):
                href = base + "/" + href.lstrip("/")

            # Date: look in sibling cells/spans
            date_str = ""
            parent = link_tag.parent
            for tag in (parent, row):
                for span in tag.find_all(["td", "span", "small", "div"]):
                    text = span.get_text(strip=True)
                    if any(c.isdigit() for c in text) and len(text) < 20:
                        date_str = text
                        break
                if date_str:
                    break

            items.append({"title": title, "notice_url": href, "date_raw": date_str})

        # Strategy 2: div-based layouts
        if not items:
            for div in soup.select(".notice, .notice-item, .news-item, article"):
                link_tag = div.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 8 or title in seen_titles:
                    continue
                seen_titles.add(title)

                href = link_tag["href"]
                if href.startswith("/"):
                    href = base + href
                elif not href.startswith("http"):
                    href = base + "/" + href.lstrip("/")

                date_tag = div.find(["time", "span"], class_=lambda c: c and "date" in c)
                date_str = date_tag.get_text(strip=True) if date_tag else ""

                items.append({"title": title, "notice_url": href, "date_raw": date_str})

        # Strategy 3: broad anchor scan filtered by notice-like keywords
        if not items:
            keywords = [
                "notice", "exam", "admission", "result", "schedule",
                "form", "scholarship", "application", "announcement"
            ]
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 10 or title in seen_titles:
                    continue
                if any(kw in title.lower() for kw in keywords):
                    seen_titles.add(title)
                    href = anchor["href"]
                    if href.startswith("/"):
                        href = base + href
                    elif not href.startswith("http"):
                        href = base + "/" + href.lstrip("/")
                    items.append({"title": title, "notice_url": href, "date_raw": ""})

        self.logger.info(f"Parsed {len(items)} notices")
        return items

    def scrape(self) -> dict:
        university_id = self.get_university_id("TU")
        if not university_id:
            self.logger.error("TU university_id not found — aborting")
            return self.summary()

        soup = None
        for url in NOTICES_URLS:
            self.logger.info(f"Trying {url}")
            soup = self.fetch_page(url)
            if soup:
                items = self.parse_notices(soup, BASE_URL)
                if items:
                    break
        else:
            self.logger.error("All notice URLs failed")
            return self.summary()

        self.logger.info(f"Processing {len(items)} notices")

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

            self.insert_record("notices", record)

        return self.summary()


if __name__ == "__main__":
    scraper = TUNoticesScraper()
    result = scraper.scrape()
    print(result)
