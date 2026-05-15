"""
NEB Notices Scraper
Target: https://www.neb.gov.np
Extracts notices and exam schedules from the National Examinations Board.
Follows each notice page for new records to extract inline content
(PDF or image) via BaseScraper.extract_content().
"""

from base_scraper import BaseScraper

BASE_URL = "https://www.neb.gov.np"
NOTICE_URLS = [
    f"{BASE_URL}/notices",
    f"{BASE_URL}/notice",
    f"{BASE_URL}/news-and-notices",
    f"{BASE_URL}/",
]


class NEBNoticesScraper(BaseScraper):
    def __init__(self):
        super().__init__("NEBNotices")

    # fetch_page is inherited from BaseScraper (DEFAULT_HEADERS + timeout)

    def parse_notices(self, soup) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        def _norm(href: str) -> str:
            if href.startswith("/"):
                return BASE_URL + href
            if not href.startswith("http"):
                return BASE_URL + "/" + href.lstrip("/")
            return href

        # Strategy 1: table rows (NEB often uses a table layout)
        for row in soup.select("table.table tr, table tr"):
            cells    = row.find_all("td")
            link_tag = row.find("a", href=True)
            if not link_tag or len(cells) < 1:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 8 or title in seen:
                continue
            seen.add(title)
            date_str = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                if any(c.isdigit() for c in text) and len(text) < 20:
                    date_str = text
                    break
            items.append({"title": title, "notice_url": _norm(link_tag["href"]), "date_raw": date_str})

        # Strategy 2: notice card divs
        if not items:
            for sel in [".notice-list li", ".notices li", ".news-list li",
                        "article", ".post-item", ".entry", ".card"]:
                for el in soup.select(sel):
                    link_tag = el.find("a", href=True)
                    if not link_tag:
                        continue
                    title = link_tag.get_text(strip=True)
                    if not title or len(title) < 8 or title in seen:
                        continue
                    seen.add(title)
                    date_tag = el.find(["time", "span"])
                    items.append({
                        "title":      title,
                        "notice_url": _norm(link_tag["href"]),
                        "date_raw":   date_tag.get_text(strip=True) if date_tag else "",
                    })
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
                    items.append({"title": title, "notice_url": _norm(anchor["href"]), "date_raw": ""})

        self.logger.info(f"Parsed {len(items)} NEB notices")
        return items

    def process_items(self, items: list[dict], university_id: str) -> None:
        for item in items:
            title = item["title"].strip()
            if not title:
                continue

            date_str = self.parse_date(item["date_raw"]) if item["date_raw"] else None
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            if self.check_exists("notices", slug):
                self.skipped += 1
                continue

            content = self.extract_content(item.get("notice_url", ""))
            if content["type"] == "pdf":
                self.logger.info(f"   Found PDF for: {title[:60]}")
            elif content["type"] == "image":
                self.logger.info(f"   Found image for: {title[:60]}")
            else:
                self.logger.debug(f"   Link only for: {title[:60]}")

            record = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "notice_url":     item.get("notice_url"),
                "notice_pdf_url": content["url"],
                "content_type":   content["type"],
                "published_date": date_str,
            }

            if self.insert_record("notices", record):
                self.send_notification(
                    title="New NEB Notice 📋",
                    message=title,
                    url=f"https://sikshyanepal.vercel.app/notices/{record['slug']}",
                )

    def scrape(self) -> dict:
        university_id = self.get_university_id("NEB", "National Examinations Board")
        if not university_id:
            self.logger.error("Could not find/create NEB — aborting")
            return self.summary()

        soup  = None
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
        self.process_items(items, university_id)
        return self.summary()


if __name__ == "__main__":
    scraper = NEBNoticesScraper()
    print(scraper.scrape())
