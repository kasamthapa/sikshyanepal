"""
Purbanchal University Results Scraper
Scrapes exam results from purbanchaluniversity.edu.np and faculty sub-portals.
Each portal is tried independently; a failure never stops the others.
"""

from base_scraper import BaseScraper

PU_RESULT_PORTALS = [
    (
        "Purbanchal University Main (purbanchaluniversity.edu.np)",
        [
            "https://purbanchaluniversity.edu.np/notices",
            "https://purbanchaluniversity.edu.np/notice",
            "https://purbanchaluniversity.edu.np/results",
            "https://purbanchaluniversity.edu.np/",
        ],
        "https://purbanchaluniversity.edu.np",
        None,
    ),
    (
        "Purbanchal University Exam Section",
        [
            "https://purbanchaluniversity.edu.np/exam-result",
            "https://purbanchaluniversity.edu.np/exam",
        ],
        "https://purbanchaluniversity.edu.np",
        None,
    ),
]

RESULT_KEYWORDS = [
    "result", "exam", "semester", "annual", "schedule",
    "परीक्षाफल", "नतिजा",
]

PROGRAM_MAP = [
    "bsc csit", "bca", "bba", "bbs", "be", "b.e",
    "ba", "bsc", "mbbs", "mba", "mbs", "ma", "msc",
    "btech", "mtech", "bhm", "bph",
]

SEM_MAP = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]


class PUResultsScraper(BaseScraper):
    def __init__(self):
        super().__init__("PUResults")

    # ── Parsing ────────────────────────────────────────────────────────────

    def parse_results(self, soup, base_url: str) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        # Strategy 1: table rows
        for row in soup.select("table tr"):
            cells    = row.find_all("td")
            link_tag = row.find("a", href=True)
            if not link_tag or len(cells) < 1:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 5 or title in seen:
                continue
            if not any(kw in title.lower() for kw in RESULT_KEYWORDS):
                continue
            seen.add(title)
            href = link_tag["href"]
            if not href.startswith("http"):
                href = base_url + "/" + href.lstrip("/")
            date_raw = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                if any(c.isdigit() for c in text) and ("-" in text or "/" in text):
                    date_raw = text
                    break
            items.append({"title": title, "result_url": href, "date_raw": date_raw})

        # Strategy 2: div/article containers
        if not items:
            for container in soup.select(
                ".notice-item, .result-item, article, "
                ".news-item, .post-item, li.item, .content-item"
            ):
                link_tag = container.find("a", href=True)
                if not link_tag:
                    continue
                title = link_tag.get_text(strip=True)
                if not title or len(title) < 5 or title in seen:
                    continue
                if not any(kw in title.lower() for kw in RESULT_KEYWORDS):
                    continue
                seen.add(title)
                href = link_tag["href"]
                if not href.startswith("http"):
                    href = base_url + "/" + href.lstrip("/")
                items.append({"title": title, "result_url": href, "date_raw": ""})

        # Strategy 3: broad anchor scan
        if not items:
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 8 or title in seen:
                    continue
                if any(kw in title.lower() for kw in RESULT_KEYWORDS):
                    seen.add(title)
                    href = anchor["href"]
                    if not href.startswith("http"):
                        href = base_url + "/" + href.lstrip("/")
                    items.append({"title": title, "result_url": href, "date_raw": ""})

        return items

    # ── Insert helpers ─────────────────────────────────────────────────────

    def process_items(
        self,
        items: list[dict],
        university_id: str,
        faculty_tag: str | None,
    ) -> None:
        for item in items:
            raw_title = item["title"].strip()
            if not raw_title:
                continue

            if faculty_tag and faculty_tag.lower() not in raw_title.lower():
                title = f"[{faculty_tag}] {raw_title}"
            else:
                title = raw_title

            date_str = self.parse_date(item["date_raw"]) if item.get("date_raw") else None
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            record: dict = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "result_url":     item.get("result_url"),
                "published_date": date_str,
            }

            title_lower = title.lower()
            for prog in PROGRAM_MAP:
                if prog in title_lower:
                    record["program"] = prog.upper().replace("B.E", "BE")
                    break
            for sem in SEM_MAP:
                if sem in title_lower:
                    record["semester"] = f"{sem} Semester"
                    break

            if self.insert_record("results", record):
                self.send_notification(
                    title="New PU Result Published 📢",
                    message=f"{title} is now available",
                    url=f"https://sikshyanepal.vercel.app/results/{record['slug']}",
                )

    # ── Main entry point ───────────────────────────────────────────────────

    def scrape(self) -> dict:
        university_id = self.get_university_id(
            "PurU",
            "Purbanchal University",
        )
        if not university_id:
            self.logger.error("PurU university_id not found — aborting")
            return self.summary()

        portal_stats: list[tuple[str, int]] = []

        for label, urls, base_url, faculty_tag in PU_RESULT_PORTALS:
            self.logger.info(f"── Portal: {label}")
            try:
                soup  = None
                items = []
                for url in urls:
                    soup = self.fetch_page(url)
                    if not soup:
                        continue
                    items = self.parse_results(soup, base_url)
                    if items:
                        self.logger.info(f"   Got {len(items)} items from {url}")
                        break

                before = self.inserted
                self.process_items(items, university_id, faculty_tag)
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
    scraper = PUResultsScraper()
    print(scraper.scrape())
