# SikshyaNepal Scrapers

Automated scrapers that pull exam results and university notices
into the SikshyaNepal Supabase database every 6 hours via GitHub Actions.

## Scrapers

| File | Source | Table | What it extracts |
|---|---|---|---|
| `tu_results.py` | tuexam.edu.np | `results` | TU exam results with program, semester, result PDF URL |
| `ku_results.py` | kuexam.edu.np | `results` | KU exam results with program, semester, result URL |
| `tu_notices.py` | tribhuvan-university.edu.np | `notices` | TU official notices, admission notices, exam schedules |
| `neb_notices.py` | neb.gov.np | `notices` | NEB exam notices, Grade 11/12 schedules, results |

All scrapers:
- Skip duplicate entries (checked by slug before inserting)
- Never crash the entire run if one record fails
- Log exactly how many records were inserted vs skipped

---

## Run locally

### 1. Set up environment

```bash
cd scrapers
cp .env.example .env
# Edit .env and fill in your values
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Run a single scraper

```bash
cd scrapers
python tu_results.py
```

### 4. Run all scrapers

```bash
cd scrapers
python run_all.py
```

---

## GitHub Secrets required

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → `service_role` key (keep secret!) |
| `VERCEL_DEPLOY_HOOK_URL` | See below |

---

## How to get the Vercel Deploy Hook URL

1. Go to [vercel.com](https://vercel.com) → open your **sikshyanepal** project
2. Click **Settings** (top nav)
3. Click **Git** in the left sidebar
4. Scroll down to **Deploy Hooks**
5. Enter a name (e.g. `scrapers-cron`) and select branch `main`
6. Click **Create Hook**
7. Copy the generated URL — it looks like:
   `https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyyyy`
8. Add it as the `VERCEL_DEPLOY_HOOK_URL` GitHub Secret

> **Note:** With `force-dynamic` on all pages, the site already fetches
> fresh data on every request. The deploy hook is only needed if you
> add statically generated pages in the future.

---

## Manual trigger

1. Go to your GitHub repo
2. Click **Actions** tab
3. Click **SikshyaNepal Data Scrapers** in the left sidebar
4. Click **Run workflow** → **Run workflow**

---

## Adding a new scraper

1. Create `scrapers/your_scraper.py` — inherit from `BaseScraper`:

```python
from base_scraper import BaseScraper

class YourScraper(BaseScraper):
    def __init__(self):
        super().__init__("YourScraperName")

    def scrape(self) -> dict:
        # fetch page, parse items, call self.insert_record(...)
        return self.summary()
```

2. Import and add it to the `scrapers` list in `run_all.py`:

```python
from your_scraper import YourScraper

scrapers = [
    ...
    ("Your Source", YourScraper),
]
```

3. That's it — the GitHub Actions workflow picks it up automatically.

---

## Troubleshooting

**"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"**
→ Copy `.env.example` to `.env` and fill in your Supabase credentials.

**"University not found: TU"**
→ Make sure you've run the schema SQL in Supabase first (universities are seeded there).

**Scraper runs but inserts 0 records**
→ The target website may have changed its HTML structure.
   Run the scraper locally and check the debug output — you'll see
   which parse strategy was tried. Update the CSS selectors in the
   relevant `parse_*` method.

**GitHub Actions shows the run as failed**
→ Check the Actions log. If only some scrapers failed, the exit code
   is still 0. Exit code 1 only fires if every single scraper crashed.
