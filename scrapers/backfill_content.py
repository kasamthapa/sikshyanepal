"""
SikshyaNepal — Backfill Content URLs
=====================================
One-off script that retroactively populates result_pdf_url / notice_pdf_url
and content_type for existing rows that were scraped before the inline-content
feature existed (content_type IS NULL or 'link', *_pdf_url IS NULL).

Run:
    cd scrapers && python backfill_content.py

Options (set as env vars or edit the constants below):
    BACKFILL_TABLES   comma-separated subset, e.g. "results,notices"
    BACKFILL_LIMIT    max rows per table (default: unlimited)
    BACKFILL_DELAY    seconds between HTTP requests (default: 1.5)
    BACKFILL_DRY_RUN  set to "1" to log without writing to DB

Progress is logged to stdout. At the end a summary shows how many rows
were updated, how many still have no inline content, and how many errors.
"""

import os
import sys
import time
import logging

sys.path.insert(0, os.path.dirname(__file__))
from base_scraper import BaseScraper

# ── Tunable constants (also overridable via env vars) ─────────────────────────
TABLES       = [t.strip() for t in os.getenv("BACKFILL_TABLES", "results,notices").split(",")]
MAX_ROWS     = int(os.getenv("BACKFILL_LIMIT", "0")) or None   # None = no cap
REQUEST_DELAY = float(os.getenv("BACKFILL_DELAY", "1.5"))       # be polite to uni servers
DRY_RUN      = os.getenv("BACKFILL_DRY_RUN", "0") == "1"

# How many rows to fetch from Supabase per page (avoids loading everything)
PAGE_SIZE = 50

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [Backfill] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("Backfill")


# ── Table config ──────────────────────────────────────────────────────────────
# (table_name, url_column, pdf_column)
TABLE_CONFIG = {
    "results": ("result_url",  "result_pdf_url"),
    "notices": ("notice_url",  "notice_pdf_url"),
    "news":    ("notice_url",  "news_pdf_url"),   # news rarely has scraped URLs
}


class BackfillScraper(BaseScraper):
    """Thin wrapper around BaseScraper — reuses extract_content and the
    Supabase client, adds batch-fetch and update helpers."""

    def __init__(self):
        super().__init__("Backfill")

    # ── DB helpers ─────────────────────────────────────────────────────────

    def fetch_batch(self, table: str, url_col: str, offset: int) -> list[dict]:
        """
        Return up to PAGE_SIZE rows from *table* where:
          - content_type IS NULL or content_type = 'link'
          - url_col IS NOT NULL and url_col != ''
        """
        try:
            result = self._execute_with_retry(
                lambda: (
                    self.supabase.table(table)
                    .select(f"id, title, {url_col}, content_type")
                    .or_("content_type.is.null,content_type.eq.link")
                    .not_.is_(url_col, "null")
                    .neq(url_col, "")
                    .range(offset, offset + PAGE_SIZE - 1)
                    .execute()
                ),
                f"fetch_batch:{table}:{offset}",
            )
            return result.data or []
        except Exception as e:
            logger.error(f"fetch_batch failed (table={table}, offset={offset}): {e}")
            return []

    def count_pending(self, table: str, url_col: str) -> int:
        """Return total rows that still need backfilling."""
        try:
            result = self._execute_with_retry(
                lambda: (
                    self.supabase.table(table)
                    .select("id", count="exact", head=True)
                    .or_("content_type.is.null,content_type.eq.link")
                    .not_.is_(url_col, "null")
                    .neq(url_col, "")
                    .execute()
                ),
                f"count_pending:{table}",
            )
            return result.count or 0
        except Exception as e:
            logger.error(f"count_pending failed (table={table}): {e}")
            return 0

    def update_row(self, table: str, row_id: str, pdf_col: str, content: dict) -> bool:
        """Write the extracted URL and content_type back to the DB row."""
        if DRY_RUN:
            return True
        try:
            self._execute_with_retry(
                lambda: (
                    self.supabase.table(table)
                    .update({
                        pdf_col:        content["url"],
                        "content_type": content["type"],
                    })
                    .eq("id", row_id)
                    .execute()
                ),
                f"update:{table}:{row_id}",
            )
            return True
        except Exception as e:
            logger.error(f"update failed (table={table}, id={row_id}): {e}")
            return False

    # ── Per-table backfill ──────────────────────────────────────────────────

    def backfill_table(self, table: str) -> dict:
        if table not in TABLE_CONFIG:
            logger.warning(f"Unknown table '{table}' — skipping")
            return {}

        url_col, pdf_col = TABLE_CONFIG[table]

        total_pending = self.count_pending(table, url_col)
        cap           = min(total_pending, MAX_ROWS) if MAX_ROWS else total_pending
        logger.info(f"{'─' * 55}")
        logger.info(f"Table: {table}  |  Pending: {total_pending}  |  Will process: {cap}")
        if DRY_RUN:
            logger.info("  DRY RUN — no DB writes")
        logger.info(f"{'─' * 55}")

        stats = {"found_pdf": 0, "found_image": 0, "still_link": 0, "errors": 0, "updated": 0}
        processed = 0
        offset    = 0

        while processed < cap:
            batch = self.fetch_batch(table, url_col, offset)
            if not batch:
                break

            for row in batch:
                if processed >= cap:
                    break

                row_id    = row["id"]
                item_url  = row.get(url_col, "") or ""
                title     = (row.get("title") or "")[:70]
                processed += 1

                if not item_url:
                    stats["still_link"] += 1
                    continue

                # Progress ticker every 10 rows
                if processed % 10 == 0 or processed == 1:
                    logger.info(f"  [{processed}/{cap}] Processing...")

                try:
                    content = self.extract_content(item_url)
                except Exception as e:
                    logger.error(f"  extract_content error for '{title}': {e}")
                    stats["errors"] += 1
                    time.sleep(REQUEST_DELAY)
                    continue

                if content["type"] == "pdf":
                    stats["found_pdf"] += 1
                    logger.info(f"  PDF   → {title}")
                elif content["type"] == "image":
                    stats["found_image"] += 1
                    logger.info(f"  Image → {title}")
                else:
                    stats["still_link"] += 1
                    logger.debug(f"  Link  → {title}")

                # Only write to DB if we actually found inline content
                if content["type"] in ("pdf", "image"):
                    ok = self.update_row(table, row_id, pdf_col, content)
                    if ok:
                        stats["updated"] += 1
                    else:
                        stats["errors"] += 1

                time.sleep(REQUEST_DELAY)

            offset += PAGE_SIZE  # advance page even if we hit cap mid-batch

        logger.info(
            f"  {table} done — "
            f"PDF: {stats['found_pdf']}  "
            f"Image: {stats['found_image']}  "
            f"Link-only: {stats['still_link']}  "
            f"Updated: {stats['updated']}  "
            f"Errors: {stats['errors']}"
        )
        return stats

    # ── Entry point ────────────────────────────────────────────────────────

    def run(self) -> None:
        logger.info("=" * 55)
        logger.info("SikshyaNepal — Content Backfill")
        logger.info(f"Tables  : {', '.join(TABLES)}")
        logger.info(f"Delay   : {REQUEST_DELAY}s between requests")
        logger.info(f"Cap     : {MAX_ROWS or 'unlimited'} rows per table")
        logger.info(f"Dry run : {'YES' if DRY_RUN else 'no'}")
        logger.info("=" * 55)

        grand = {"found_pdf": 0, "found_image": 0, "still_link": 0, "errors": 0, "updated": 0}

        for table in TABLES:
            stats = self.backfill_table(table)
            for key in grand:
                grand[key] += stats.get(key, 0)

        logger.info("")
        logger.info("=" * 55)
        logger.info("BACKFILL COMPLETE")
        logger.info(f"  PDFs found     : {grand['found_pdf']}")
        logger.info(f"  Images found   : {grand['found_image']}")
        logger.info(f"  Link-only      : {grand['still_link']}")
        logger.info(f"  DB rows updated: {grand['updated']}{' (dry run)' if DRY_RUN else ''}")
        logger.info(f"  Errors         : {grand['errors']}")
        logger.info("=" * 55)

        if grand["errors"]:
            logger.warning("Some rows errored — check logs above and re-run if needed.")
        if grand["still_link"] > 0:
            logger.info(
                f"{grand['still_link']} rows have no inline content (university page "
                "returned no PDF/image). That's normal — not every notice has one."
            )


if __name__ == "__main__":
    BackfillScraper().run()
