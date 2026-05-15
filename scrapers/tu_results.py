"""
TU Results Scraper — Multi-Portal
Scrapes exam results from tuexam.edu.np AND all major TU faculty portals.
Each portal is tried independently; a failure in one never stops the others.

URL status (last verified 2025-05):
  CONFIRMED working  : tuexam.edu.np, tuiost.edu.np, iaas.edu.np
  REDIRECT fixed     : fohss.tu.edu.np  (was tufohss.edu.np)
  BEST GUESS         : tum.edu.np (was management.tu.edu.np — needs testing)
  BEST GUESS         : tuec.edu.np / tucded.edu.np (was education.tu.edu.np)
  BEST GUESS         : doece.tu.edu.np / ioe.edu.np (was doep.tu.edu.np)
  BEST GUESS         : iofr.edu.np (was forestry.tu.edu.np)
"""

import re
from urllib.parse import urlparse
from base_scraper import BaseScraper

# ── Portal registry ────────────────────────────────────────────────────────
# (label, urls_to_try, faculty_tag | None, fetch_kwargs)
# base_url is derived dynamically from whichever URL succeeds.
TU_RESULT_PORTALS = [
    (
        "TU Main Exam (tuexam.edu.np)",
        ["https://tuexam.edu.np/"],
        None,           # titles from tuexam already mention faculty
        {},
    ),
    (
        "TU Humanities & Social Sciences (fohss.tu.edu.np)",
        # tufohss.edu.np redirects here — try https first, fall back to http
        [
            "https://fohss.tu.edu.np/notices",
            "https://fohss.tu.edu.np/",
            "http://fohss.tu.edu.np/notices",
            "http://fohss.tu.edu.np/",
        ],
        "Humanities",
        {},
    ),
    (
        "TU Science & Technology (tuiost.edu.np)",
        ["https://tuiost.edu.np/notices", "https://tuiost.edu.np/"],
        "Science & Technology",
        {},
    ),
    (
        "TU Management (tum.edu.np)",
        # management.tu.edu.np does not resolve — tum.edu.np is best guess
        [
            "https://tum.edu.np/notices",
            "https://tum.edu.np/notice",
            "https://tum.edu.np/",
        ],
        "Management",
        {},
    ),
    (
        "TU Education (tuec.edu.np / tucded.edu.np)",
        # education.tu.edu.np does not resolve — trying known alternatives
        [
            "https://tuec.edu.np/notices",
            "https://tuec.edu.np/",
            "https://tucded.edu.np/notices",
            "https://tucded.edu.np/",
        ],
        "Education",
        {},
    ),
    (
        "TU Engineering (doece.tu.edu.np / ioe.edu.np)",
        # doep.tu.edu.np does not resolve — IOE is TU's engineering institute
        [
            "https://doece.tu.edu.np/notices",
            "https://doece.tu.edu.np/",
            "https://ioe.edu.np/notices",
            "https://ioe.edu.np/",
        ],
        "Engineering",
        {},
    ),
    (
        "TU Forestry (iofr.edu.np)",
        # forestry.tu.edu.np does not resolve — iofr.edu.np is best guess
        [
            "https://iofr.edu.np/notices",
            "https://iofr.edu.np/",
        ],
        "Forestry",
        {},
    ),
    (
        "TU Agriculture / IAAS (iaas.edu.np)",
        # Intermittently slow — use 30 s timeout
        ["https://iaas.edu.np/notices", "https://iaas.edu.np/notice", "https://iaas.edu.np/"],
        "Agriculture",
        {"timeout": 30},
    ),
]

RESULT_KEYWORDS = [
    "result", "परीक्षाफल", "नतिजा",
]

PROGRAM_MAP = [
    "bsc csit", "bca", "bba", "bbs", "be", "b.e",
    "ba", "bsc", "mbbs", "mba", "mbs", "ma", "msc",
]

SEM_MAP = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]


class TUResultsScraper(BaseScraper):
    def __init__(self):
        super().__init__("TUResults")

    # ── Parsing ────────────────────────────────────────────────────────────

    def parse_results(self, soup, base_url: str) -> list[dict]:
        """Parse result entries from a portal page. PDF/image detection happens
        later in process_items (only for new records, to avoid redundant fetches)."""
        items: list[dict] = []
        seen:  set[str]   = set()

        def _norm(href: str) -> str:
            if not href.startswith("http"):
                href = base_url + "/" + href.lstrip("/")
            return href

        # Strategy 1: tuexam card layout (.col-md-4 with <b> + btn-primary link)
        for card in soup.select(".col-md-7 .col-md-4, .col-md-4"):
            b_tag    = card.find("b")
            link_tag = (
                card.find("a", class_="btn-primary")
                or card.find("a", href=lambda h: h and "view-notice" in h)
            )
            if not b_tag or not link_tag:
                continue
            title = b_tag.get_text(strip=True)
            if not title or len(title) < 5 or title in seen:
                continue
            seen.add(title)
            date_m = re.search(
                r"[\(\[]*(?:Published Date|Date):\s*([\d/\-]+)", title, re.IGNORECASE
            )
            items.append({
                "title":      title,
                "result_url": _norm(link_tag["href"]),
                "date_raw":   date_m.group(1) if date_m else "",
            })

        # Strategy 2: table rows (keyword-filtered to avoid scraping notice rows)
        if not items:
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
                date_raw = ""
                for cell in cells:
                    text = cell.get_text(strip=True)
                    if any(c.isdigit() for c in text) and ("-" in text or "/" in text):
                        date_raw = text
                        break
                items.append({"title": title, "result_url": _norm(link_tag["href"]), "date_raw": date_raw})

        # Strategy 3: div/article containers
        if not items:
            for container in soup.select(
                ".notice-item, .result-item, article, .news-item, .post-item, li.item"
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
                items.append({"title": title, "result_url": _norm(link_tag["href"]), "date_raw": ""})

        # Strategy 4: broad anchor scan
        if not items:
            for anchor in soup.find_all("a", href=True):
                title = anchor.get_text(strip=True)
                if len(title) < 8 or title in seen:
                    continue
                if any(kw in title.lower() for kw in RESULT_KEYWORDS):
                    seen.add(title)
                    items.append({"title": title, "result_url": _norm(anchor["href"]), "date_raw": ""})

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

            # Prefix faculty tag if the portal has one and it's not in the title
            if faculty_tag and faculty_tag.lower() not in raw_title.lower():
                title = f"[{faculty_tag}] {raw_title}"
            else:
                title = raw_title

            # parse_date() returns today as fallback when date_raw is empty/missing
            date_str = self.parse_date(item.get("date_raw", ""))
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            # Skip duplicates — slug check first (fast), then title+uni check (catches
            # same content re-scraped on a different day with a different slug suffix)
            if self.check_exists("results", slug):
                self.skipped += 1
                continue
            if self.check_title_exists("results", title, university_id):
                self.skipped += 1
                continue

            # Extract inline content (PDF / image) for new records only
            content = self.extract_content(item.get("result_url", ""))
            if content["type"] == "pdf":
                self.logger.info(f"   Found PDF for: {title[:60]}")
            elif content["type"] == "image":
                self.logger.info(f"   Found image for: {title[:60]}")
            else:
                self.logger.debug(f"   Link only for: {title[:60]}")

            record: dict = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "result_url":     item.get("result_url"),
                "result_pdf_url": content["url"],
                "content_type":   content["type"],
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
                    title="New Result Published 📢",
                    message=f"{title} is now available",
                    url=f"https://sikshyanepal.vercel.app/results/{record['slug']}",
                )

    # ── Main entry point ───────────────────────────────────────────────────

    def scrape(self) -> dict:
        university_id = self.get_university_id("TU")
        if not university_id:
            self.logger.error("TU university_id not found — aborting")
            return self.summary()

        portal_stats: list[tuple[str, int]] = []

        for label, urls, faculty_tag, fetch_kwargs in TU_RESULT_PORTALS:
            self.logger.info(f"── Portal: {label}")
            try:
                soup     = None
                items    = []
                base_url = ""
                for url in urls:
                    soup = self.fetch_page(url, **fetch_kwargs)
                    if not soup:
                        continue
                    # Derive base_url from the URL that actually worked
                    parsed   = urlparse(url)
                    base_url = f"{parsed.scheme}://{parsed.netloc}"
                    items    = self.parse_results(soup, base_url)
                    self.logger.info(f"   Found {len(items)} entries from {url}")
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
    scraper = TUResultsScraper()
    print(scraper.scrape())
