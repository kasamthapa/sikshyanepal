"""
KU Results Scraper
Target: https://kuexam.edu.np
Extracts exam results and inserts into the `results` table.
Follows each result page for new records to extract inline content
(PDF or image) via BaseScraper.extract_content().
"""

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
            date_str = ""
            for cell in cells:
                text = cell.get_text(strip=True)
                if any(c.isdigit() for c in text) and (
                    "-" in text or "/" in text or len(text) < 15
                ):
                    date_str = text
                    break
            items.append({"title": title, "result_url": _norm(link_tag["href"]), "date_raw": date_str})

        # Strategy 2: list / div layout
        if not items:
            keywords = ["result", "semester", "year", "grade"]
            for anchor in soup.select(
                "ul li a, .result-list a, .notice-list a, .content a, .main-content a"
            ):
                title = anchor.get_text(strip=True)
                if not title or len(title) < 8 or title in seen:
                    continue
                if not any(kw in title.lower() for kw in keywords):
                    continue
                seen.add(title)
                items.append({"title": title, "result_url": _norm(anchor.get("href", "")), "date_raw": ""})

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

            record = {
                "title":          title,
                "slug":           slug,
                "university_id":  university_id,
                "result_url":     item.get("result_url"),
                "result_pdf_url": content["url"],
                "content_type":   content["type"],
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
