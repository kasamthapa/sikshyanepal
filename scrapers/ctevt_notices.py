"""
CTEVT Notices Scraper
Scrapes notices from ctevt.org.np — covers technical & vocational education.
Very popular for diploma students across Nepal.
"""

from base_scraper import BaseScraper

CTEVT_PORTALS = [
    (
        "CTEVT Main (ctevt.org.np)",
        [
            "https://ctevt.org.np/notices",
            "https://ctevt.org.np/notice",
            "https://ctevt.org.np/",
        ],
        "https://ctevt.org.np",
    ),
]

NOTICE_KEYWORDS = [
    "notice", "exam", "admission", "result", "schedule",
    "form", "scholarship", "application", "announcement",
    "diploma", "technical", "vocational",
    "सूचना", "परीक्षा", "भर्ना",
]


class CTEVTNoticesScraper(BaseScraper):
    def __init__(self):
        super().__init__("CTEVTNotices")

    # ── Parsing ────────────────────────────────────────────────────────────

    def parse_notices(self, soup, base_url: str) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        # Strategy 1: table rows / list items with links
        for row in soup.select("table tr, .notice-list li, .announcement-list li, ul.list li"):
            link_tag = row.find("a", href=True)
            if not link_tag:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 8 or title in seen:
                continue
            seen.add(title)
            href = link_tag["href"]
            if href.startswith("/"):
                href = base_url + href
            elif not href.startswith("http"):
                href = base_url + "/" + href.lstrip("/")
            date_raw = ""
            parent = link_tag.parent
            for tag in (parent, row):
                for span in tag.find_all(["td", "span", "small", "div"]):
                    text = span.get_text(strip=True)
                    if any(c.isdigit() for c in text) and len(text) < 20:
                        date_raw = text
                        break
                if date_raw:
                    break
            items.append({"title": title, "notice_url": href, "date_raw": date_raw})

        # Strategy 2: div/article containers
        if not items:
            for div in soup.select(
                ".notice, .notice-item, .news-item, "
                "article, .post, .content-item, .entry"
            ):
                link_tag = div.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 8 or title in seen:
                    continue
                seen.add(title)
                href = link_tag["href"]
                if href.startswith("/"):
                    href = base_url + href
                elif not href.startswith("http"):
                    href = base_url + "/" + href.lstrip("/")
                date_tag = div.find(["time", "span"], class_=lambda c: c and "date" in c)
                date_raw = date_tag.get_text(strip=True) if date_tag else ""
                items.append({"title": title, "notice_url": href, "date_raw": date_raw})

        # Strategy 3: broad anchor scan filtered by notice keywords
        if not items:
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 10 or title in seen:
                    continue
                if any(kw in title.lower() for kw in NOTICE_KEYWORDS):
                    seen.add(title)
                    href = anchor["href"]
                    if href.startswith("/"):
                        href = base_url + href
                    elif not href.startswith("http"):
                        href = base_url + "/" + href.lstrip("/")
                    items.append({"title": title, "notice_url": href, "date_raw": ""})

        return items

    # ── Insert helpers ─────────────────────────────────────────────────────

    def process_items(self, items: list[dict], university_id: str) -> None:
        for item in items:
            title = item["title"].strip()
            if not title:
                continue

            date_str = self.parse_date(item["date_raw"]) if item.get("date_raw") else None
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            record = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "notice_url":     item.get("notice_url"),
                "published_date": date_str,
            }

            if self.insert_record("notices", record):
                self.send_notification(
                    title="New CTEVT Notice 📋",
                    message=title,
                    url=f"https://sikshyanepal.vercel.app/notices/{record['slug']}",
                )

    # ── Main entry point ───────────────────────────────────────────────────

    def scrape(self) -> dict:
        university_id = self.get_university_id(
            "CTEVT",
            "Council for Technical Education and Vocational Training",
        )
        if not university_id:
            self.logger.error("CTEVT university_id not found — aborting")
            return self.summary()

        portal_stats: list[tuple[str, int]] = []

        for label, urls, base_url in CTEVT_PORTALS:
            self.logger.info(f"── Portal: {label}")
            try:
                soup  = None
                items = []
                for url in urls:
                    soup = self.fetch_page(url)
                    if not soup:
                        continue
                    items = self.parse_notices(soup, base_url)
                    if items:
                        self.logger.info(f"   Got {len(items)} items from {url}")
                        break

                before = self.inserted
                self.process_items(items, university_id)
                portal_stats.append((label, self.inserted - before))

            except Exception as e:
                self.logger.error(f"   Portal crashed: {e}")
                portal_stats.append((label, -1))

        self.logger.info("── Portal summary:")
        for label, count in portal_stats:
            status = f"{count} new" if count >= 0 else "FAILED"
            self.logger.info(f"   {status:>8}  {label}")

        return self.summary()


if __name__ == "__main__":
    scraper = CTEVTNoticesScraper()
    print(scraper.scrape())
