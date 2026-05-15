"""
KU Results Scraper
Target: https://kuexam.edu.np
Extracts exam results and inserts into the `results` table.
Follows each result page to extract a direct PDF URL when available.
"""

from urllib.parse import urlparse
from base_scraper import BaseScraper

BASE_URL    = "https://exam.ku.edu.np"
RESULTS_URL = f"{BASE_URL}/"


class KUResultsScraper(BaseScraper):
    def __init__(self):
        super().__init__("KUResults")

    # fetch_page is inherited from BaseScraper (DEFAULT_HEADERS + timeout)

    def parse_results(self, soup) -> list[dict]:
        items: list[dict] = []
        seen:  set[str]   = set()

        def _norm(href: str) -> str:
            if not href.startswith("http"):
                href = BASE_URL + "/" + href.lstrip("/")
            return href

        def _pdf_or_none(href: str) -> str | None:
            return href if ".pdf" in href.lower() else None

        # Strategy 1: table rows
        for row in soup.select("table tr"):
            cells    = row.find_all("td")
            link_tag = row.find("a", href=True)
            if not link_tag or len(cells) < 1:
                continue
            title = link_tag.get_text(strip=True)
            if not title or len(title) < 5 or title in seen:
                continue
            seen.add(title)
            href = _norm(link_tag["href"])
            date_str = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                if any(c.isdigit() for c in text) and (
                    "-" in text or "/" in text or len(text) < 15
                ):
                    date_str = text
                    break
            items.append({
                "title":          title,
                "result_url":     href,
                "result_pdf_url": _pdf_or_none(href),
                "date_raw":       date_str,
            })

        # Strategy 2: list / div layout
        if not items:
            keywords = ["result", "exam", "semester", "year", "grade"]
            for anchor in soup.select(
                "ul li a, .result-list a, .notice-list a, "
                ".content a, .main-content a"
            ):
                title = anchor.get_text(strip=True)
                if not title or len(title) < 8 or title in seen:
                    continue
                href = _norm(anchor.get("href", ""))
                if not any(kw in title.lower() for kw in keywords):
                    continue
                seen.add(title)
                items.append({
                    "title":          title,
                    "result_url":     href,
                    "result_pdf_url": _pdf_or_none(href),
                    "date_raw":       "",
                })

        self.logger.info(f"Found {len(items)} result entries")
        return items

    def scrape(self) -> dict:
        self.logger.info(f"Scraping KU results from {RESULTS_URL}")

        university_id = self.get_university_id("KU")
        if not university_id:
            self.logger.error("KU university_id not found — aborting")
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
            slug     = self.slugify_with_date(title, item.get("date_raw", ""))

            # Skip duplicates early
            if self.check_exists("results", slug):
                self.skipped += 1
                continue

            # Try to find a PDF — from direct link first, then by following the page
            pdf_url = item.get("result_pdf_url")
            if not pdf_url and item.get("result_url"):
                result_url = item["result_url"]
                parsed = urlparse(result_url)
                base   = f"{parsed.scheme}://{parsed.netloc}"
                pdf_url = self.fetch_pdf_from_page(result_url, base)
                if pdf_url:
                    self.logger.info(f"   PDF found via page follow: {pdf_url[:80]}")

            record = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "result_url":     item.get("result_url"),
                "result_pdf_url": pdf_url,
                "published_date": date_str,
            }

            title_lower = title.lower()
            for prog in ["be", "bsc", "bba", "mba", "msc", "phd", "mbbs"]:
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
    scraper = KUResultsScraper()
    result  = scraper.scrape()
    print(result)
