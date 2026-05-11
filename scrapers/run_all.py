"""
SikshyaNepal — Run All Scrapers
Executes every scraper in sequence, collects totals,
triggers a Vercel redeploy if new records were inserted,
and optionally posts to Facebook if credentials are set.

Exit code: 0 = success (even if some scrapers had errors)
           1 = all scrapers failed
"""

import os
import sys
import logging
import requests
from dotenv import load_dotenv

# Allow running from any directory
sys.path.insert(0, os.path.dirname(__file__))

from tu_results import TUResultsScraper
from ku_results import KUResultsScraper
from tu_notices import TUNoticesScraper
from neb_notices import NEBNoticesScraper

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("RunAll")


def trigger_vercel_deploy(total_inserted: int) -> None:
    hook_url = os.getenv("VERCEL_DEPLOY_HOOK_URL")
    if not hook_url:
        logger.info("VERCEL_DEPLOY_HOOK_URL not set — skipping redeploy trigger")
        return
    if total_inserted == 0:
        logger.info("No new records — skipping Vercel redeploy")
        return
    try:
        resp = requests.post(hook_url, timeout=10)
        if resp.status_code == 201:
            logger.info(f"Vercel deploy triggered ({total_inserted} new records)")
        else:
            logger.warning(f"Vercel deploy returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Vercel deploy trigger failed: {e}")


def post_to_facebook(message: str, link: str) -> None:
    """
    Post a message to the configured Facebook Page.
    Silently skips if FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN are not set.
    Never raises — failures are logged as warnings only.
    """
    page_id    = os.getenv("FB_PAGE_ID")
    page_token = os.getenv("FB_PAGE_ACCESS_TOKEN")
    if not page_id or not page_token:
        return
    try:
        resp = requests.post(
            f"https://graph.facebook.com/v19.0/{page_id}/feed",
            data={
                "message":      message,
                "link":         link,
                "access_token": page_token,
            },
            timeout=15,
        )
        if resp.status_code == 200:
            logger.info(f"Facebook post published: {message[:60]}")
        else:
            logger.warning(f"Facebook post failed ({resp.status_code}): {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Facebook post error: {e}")


def run() -> int:
    scrapers = [
        ("TU Results",  TUResultsScraper),
        ("KU Results",  KUResultsScraper),
        ("TU Notices",  TUNoticesScraper),
        ("NEB Notices", NEBNoticesScraper),
    ]

    totals = {"inserted": 0, "skipped": 0, "errors": 0}
    failed_scrapers = []

    for label, ScraperClass in scrapers:
        logger.info(f"{'=' * 50}")
        logger.info(f"Starting: {label}")
        logger.info(f"{'=' * 50}")
        try:
            result = ScraperClass().scrape()
            totals["inserted"] += result.get("inserted", 0)
            totals["skipped"]  += result.get("skipped", 0)
            totals["errors"]   += result.get("errors", 0)
        except Exception as e:
            logger.error(f"{label} scraper crashed entirely: {e}")
            failed_scrapers.append(label)

    # Summary
    logger.info("")
    logger.info("=" * 50)
    logger.info("SCRAPER RUN COMPLETE")
    logger.info(f"  New records inserted : {totals['inserted']}")
    logger.info(f"  Duplicates skipped   : {totals['skipped']}")
    logger.info(f"  Record-level errors  : {totals['errors']}")
    if failed_scrapers:
        logger.warning(f"  Scrapers that crashed: {', '.join(failed_scrapers)}")
    logger.info("=" * 50)

    trigger_vercel_deploy(totals["inserted"])

    # Facebook summary post (only when new records inserted)
    if totals["inserted"] > 0:
        post_to_facebook(
            message=(
                f"📢 {totals['inserted']} new update{'s' if totals['inserted'] > 1 else ''} just published on SikshyaNepal!\n"
                "Check the latest results and notices 👉"
            ),
            link="https://sikshyanepal.vercel.app",
        )

    # Exit 1 only if every single scraper crashed
    if len(failed_scrapers) == len(scrapers):
        logger.error("All scrapers failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(run())
