-- Correct verified programme durations in the initial catalogue.
-- These entries use programme-specific official Tribhuvan University sources.

UPDATE programs
SET
  duration = '4 Years',
  source_url = 'https://mahemc.tu.edu.np/courses/701',
  last_verified_at = NOW(),
  updated_at = NOW()
WHERE slug = 'bca';

UPDATE programs
SET
  duration = '4 Years',
  source_url = 'https://portal.tu.edu.np/downloads/2024_12_26_11_21_06.pdf',
  last_verified_at = NOW(),
  updated_at = NOW()
WHERE slug = 'bbm';

-- LL.B. is the graduate-entry programme. Do not confuse it with the distinct
-- five-year BA LL.B. route, which needs its own programme record if added.
UPDATE programs
SET
  duration = '3 Years',
  source_url = 'https://www.nlc.tu.edu.np/pages/llb-admission-rules-2319',
  last_verified_at = NOW(),
  updated_at = NOW()
WHERE slug = 'llb';
