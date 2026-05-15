"""
Base scraper class for SikshyaNepal.
All scrapers inherit from this — handles Supabase connection,
duplicate checking, slug generation, and logging.
"""

import os
import re
import unicodedata
import logging
import requests
import urllib3
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv
from supabase import create_client, Client
from bs4 import BeautifulSoup

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DEFAULT_TIMEOUT = 15
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SikshyaNepalBot/1.0; "
        "+https://sikshyanepal.vercel.app)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


class BaseScraper:
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(name)
        self.inserted = 0
        self.skipped = 0
        self.errors = 0
        self.supabase: Client = self._connect()

    # ------------------------------------------------------------------
    # Supabase
    # ------------------------------------------------------------------

    def _connect(self) -> Client:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
            )
        self.logger.info("Connected to Supabase")
        return create_client(url, key)

    def _execute_with_retry(self, fn, label: str):
        """Run fn() up to 2 times, retrying once on connection errors."""
        for attempt in range(2):
            try:
                return fn()
            except Exception as e:
                if attempt == 0 and "ConnectionTerminated" in str(type(e).__name__ + str(e)):
                    continue
                raise
        raise RuntimeError(f"All retries failed for {label}")

    def check_exists(self, table: str, slug: str) -> bool:
        """Return True if a record with this slug already exists."""
        try:
            result = self._execute_with_retry(
                lambda: (
                    self.supabase.table(table)
                    .select("id")
                    .eq("slug", slug)
                    .limit(1)
                    .execute()
                ),
                f"check_exists:{slug}",
            )
            return len(result.data) > 0
        except Exception as e:
            self.logger.warning(f"check_exists failed for slug={slug}: {e}")
            return False

    def insert_record(self, table: str, data: dict) -> bool:
        """
        Insert a record. Returns True if inserted, False if skipped or errored.
        Treats duplicate-key (23505 / 409) as a skip, not an error.
        Never raises — logs and continues.
        """
        slug = data.get("slug", "")
        if self.check_exists(table, slug):
            self.logger.debug(f"Skip (exists): {slug}")
            self.skipped += 1
            return False
        try:
            self._execute_with_retry(
                lambda: self.supabase.table(table).insert(data).execute(),
                f"insert:{slug}",
            )
            self.logger.info(f"Inserted: {data.get('title', slug)[:80]}")
            self.inserted += 1
            return True
        except Exception as e:
            err = str(e)
            if "23505" in err or "duplicate key" in err.lower() or "409" in err:
                self.logger.debug(f"Skip (duplicate on insert): {slug}")
                self.skipped += 1
                return False
            self.logger.error(f"Insert failed for slug={slug}: {e}")
            self.errors += 1
            return False

    # ------------------------------------------------------------------
    # University lookup (cached)
    # ------------------------------------------------------------------

    _university_cache: dict[str, str] = {}

    def get_university_id(self, short_name: str, full_name: str | None = None) -> str | None:
        """
        Look up a university's UUID by short_name.
        If not found and full_name is provided, creates the entry.
        """
        if short_name in self._university_cache:
            return self._university_cache[short_name]

        try:
            result = self._execute_with_retry(
                lambda: (
                    self.supabase.table("universities")
                    .select("id")
                    .eq("short_name", short_name)
                    .limit(1)
                    .execute()
                ),
                f"get_university:{short_name}",
            )
            if result.data:
                uid = result.data[0]["id"]
                self._university_cache[short_name] = uid
                return uid

            # Create it if full_name provided
            if full_name:
                self.logger.info(f"Creating university: {full_name} ({short_name})")
                row = {
                    "name": full_name,
                    "slug": self.slugify(full_name),
                    "short_name": short_name,
                }
                res = self._execute_with_retry(
                    lambda: self.supabase.table("universities").insert(row).execute(),
                    f"create_university:{short_name}",
                )
                if res.data:
                    uid = res.data[0]["id"]
                    self._university_cache[short_name] = uid
                    return uid

        except Exception as e:
            self.logger.error(f"get_university_id failed for {short_name}: {e}")

        self.logger.warning(f"University not found: {short_name}")
        return None

    # ------------------------------------------------------------------
    # HTTP fetch helper (shared by all scrapers)
    # ------------------------------------------------------------------

    def fetch_page(
        self,
        url: str,
        timeout: int = DEFAULT_TIMEOUT,
        verify: bool = False,
        extra_headers: dict | None = None,
    ) -> "BeautifulSoup | None":
        """
        GET a URL and return a BeautifulSoup object.
        Returns None on any error — never raises.
        Subclasses can override or call super().fetch_page().
        """
        headers = {**DEFAULT_HEADERS, **(extra_headers or {})}
        try:
            resp = requests.get(url, headers=headers, timeout=timeout, verify=verify)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except Exception as e:
            self.logger.warning(f"fetch_page failed [{url}]: {e}")
            return None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def slugify(text: str) -> str:
        """Generate a URL-safe ASCII slug from text."""
        # Normalize unicode then strip non-ASCII (handles Nepali/Devanagari)
        text = unicodedata.normalize("NFKD", text)
        text = text.encode("ascii", "ignore").decode("ascii")
        text = text.lower().strip()
        text = re.sub(r"[^\w\s-]", "", text)
        text = re.sub(r"[\s_]+", "-", text)
        text = re.sub(r"-+", "-", text)
        return text[:200].strip("-")

    @staticmethod
    def slugify_with_date(title: str, date_str: str = "") -> str:
        """Slug that includes a date suffix to avoid collisions."""
        base = BaseScraper.slugify(title)[:150]
        if date_str:
            suffix = BaseScraper.slugify(date_str)[:20]
            return f"{base}-{suffix}" if suffix else base
        ts = datetime.now().strftime("%Y%m%d")
        return f"{base}-{ts}"

    @staticmethod
    def parse_date(raw: str) -> str:
        """
        Try to parse a date string into ISO 8601 format.
        Returns today's date string as fallback.
        """
        raw = raw.strip()
        formats = [
            "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%B %d, %Y",
            "%b %d, %Y", "%d %B %Y", "%d %b %Y", "%Y/%m/%d",
        ]
        for fmt in formats:
            try:
                return datetime.strptime(raw, fmt).isoformat()
            except ValueError:
                continue
        return datetime.now().isoformat()

    # ------------------------------------------------------------------
    # Push notifications (OneSignal REST API)
    # ------------------------------------------------------------------

    def send_notification(self, title: str, message: str, url: str) -> None:
        """
        Send a push notification via OneSignal REST API.
        Silently skips if ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY are not set.
        Never raises — failures are logged as warnings only.
        """
        app_id  = os.getenv("ONESIGNAL_APP_ID")
        api_key = os.getenv("ONESIGNAL_REST_API_KEY")
        if not app_id or not api_key:
            return

        payload = {
            "app_id": app_id,
            "included_segments": ["All"],
            "headings":  {"en": title},
            "contents":  {"en": message},
            "url":       url,
        }
        try:
            import requests as req
            resp = req.post(
                "https://onesignal.com/api/v1/notifications",
                json=payload,
                headers={
                    "Authorization": f"Basic {api_key}",
                    "Content-Type":  "application/json",
                },
                timeout=10,
            )
            if resp.status_code == 200:
                self.logger.info(f"Push sent: {title}")
            else:
                self.logger.warning(f"Push failed ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            self.logger.warning(f"Push notification error: {e}")

    # ------------------------------------------------------------------
    # PDF helpers
    # ------------------------------------------------------------------

    def find_pdf_links(self, soup, base_url: str) -> list[str]:
        """
        Return a list of absolute PDF URLs found on the page, deduped.

        Two passes:
          1. Direct: href ends with .pdf or contains .pdf? / /pdf/
          2. Keyword: anchor text contains result/notice/schedule/exam keywords
             AND href looks like a file download path — catches university sites
             that serve PDFs via PHP/ASP redirectors without a .pdf extension.

        Direct PDF hrefs are returned first (higher confidence).
        """
        _PDF_EXT_MARKERS  = (".pdf", ".pdf?", "/pdf/")
        _DOWNLOAD_MARKERS = ("/download", "/files/", "/uploads/", "/notice/", "/result/", "view=")
        _TEXT_KEYWORDS    = ["result", "notice", "schedule", "exam", "download", "view pdf"]

        direct:   list[str] = []
        indirect: list[str] = []
        seen:     set[str]  = set()

        for anchor in soup.find_all("a", href=True):
            raw = anchor["href"].strip()
            if not raw or raw.startswith("#") or raw.startswith("mailto:"):
                continue

            # Normalise to absolute URL
            if raw.startswith("//"):
                raw = "https:" + raw
            elif raw.startswith("/"):
                raw = base_url + raw
            elif not raw.startswith("http"):
                raw = base_url + "/" + raw.lstrip("/")

            if raw in seen:
                continue
            seen.add(raw)

            raw_lower = raw.lower()
            is_direct_pdf = any(m in raw_lower for m in _PDF_EXT_MARKERS)

            if is_direct_pdf:
                direct.append(raw)
            else:
                text = anchor.get_text(strip=True).lower()
                text_match = any(kw in text for kw in _TEXT_KEYWORDS)
                has_dl_path = any(m in raw_lower for m in _DOWNLOAD_MARKERS)
                if text_match and has_dl_path:
                    indirect.append(raw)

        return direct + indirect

    def find_image_links(self, soup, base_url: str) -> list[str]:
        """
        Return absolute image URLs from the page that are likely result/notice
        screenshots (linked <a> hrefs + content-area <img> src attributes).
        Excludes obvious UI/brand images (logos, icons, banners, avatars).
        """
        IMAGE_EXTS    = (".jpg", ".jpeg", ".png", ".gif", ".webp")
        EXCLUDE_TERMS = ("logo", "icon", "banner", "header", "footer",
                         "sprite", "thumb", "avatar", "placeholder", "bg-",
                         "favicon", "brand", "social")

        urls: list[str] = []
        seen: set[str]  = set()

        def _norm(src: str) -> str | None:
            src = src.strip()
            if not src or src.startswith("data:") or src.startswith("#"):
                return None
            if src.startswith("//"):
                return "https:" + src
            if src.startswith("/"):
                return base_url + src
            if not src.startswith("http"):
                return base_url + "/" + src.lstrip("/")
            return src

        def _keep(url: str) -> bool:
            low = url.lower()
            return (
                any(low.endswith(ext) for ext in IMAGE_EXTS)
                and not any(t in low for t in EXCLUDE_TERMS)
            )

        # Linked images: <a href="...jpg">
        for anchor in soup.find_all("a", href=True):
            url = _norm(anchor["href"])
            if url and url not in seen and _keep(url):
                seen.add(url)
                urls.append(url)

        # Embedded images inside content areas
        for img in soup.select(
            "main img, .content img, article img, "
            ".result-image img, .notice-content img, .entry-content img"
        ):
            url = _norm(img.get("src", ""))
            if url and url not in seen and _keep(url):
                seen.add(url)
                urls.append(url)

        return urls

    def extract_content(self, item_url: str) -> dict:
        """
        Determine the richest inline content available for a scraped item URL.

        Returns {"url": str | None, "type": "pdf" | "image" | "link"}

        Priority:
          1. item_url itself is a PDF (no HTTP needed)
          2. Fetch the page → find PDFs
          3. Fetch the page → find images
          4. Fallback → type="link", url=None

        Uses a 10 s timeout so slow university servers don't block the run.
        content_type values match the DB column: 'pdf', 'image', 'link'.
        Never raises — always returns a valid dict.
        """
        empty = {"url": None, "type": "link"}

        if not item_url:
            return empty

        # ── Fast path: URL itself is a PDF ─────────────────────────────
        url_lower = item_url.lower()
        if any(m in url_lower for m in (".pdf", ".pdf?", "/pdf/")):
            return {"url": item_url, "type": "pdf"}

        # ── Fetch the linked page ───────────────────────────────────────
        parsed   = urlparse(item_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        soup     = self.fetch_page(item_url, timeout=10)
        if not soup:
            return empty

        # PDFs first (higher value than images for result/notice content)
        pdfs = self.find_pdf_links(soup, base_url)
        if pdfs:
            return {"url": pdfs[0], "type": "pdf"}

        # Images second
        images = self.find_image_links(soup, base_url)
        if images:
            return {"url": images[0], "type": "image"}

        return empty

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------

    def summary(self) -> dict:
        self.logger.info(
            f"Done — inserted: {self.inserted}, "
            f"skipped: {self.skipped}, errors: {self.errors}"
        )
        return {
            "scraper": self.name,
            "inserted": self.inserted,
            "skipped": self.skipped,
            "errors": self.errors,
        }

    # ------------------------------------------------------------------
    # Override in subclasses
    # ------------------------------------------------------------------

    def scrape(self) -> dict:
        raise NotImplementedError("Subclasses must implement scrape()")
