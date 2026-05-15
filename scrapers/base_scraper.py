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
