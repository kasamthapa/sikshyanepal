-- First source-verification batch for high-use core programmes.

UPDATE programs SET source_url = 'https://cdcsit.tu.edu.np/pages/bi-2734', last_verified_at = NOW(), updated_at = NOW() WHERE slug = 'bit' AND duration = '4 Years';
UPDATE programs SET source_url = 'https://cdcsit.tu.edu.np/pages/bs-2733', last_verified_at = NOW(), updated_at = NOW() WHERE slug = 'bsc-csit' AND duration = '4 Years';
UPDATE programs SET source_url = 'https://sdc.tu.edu.np/courses/272', last_verified_at = NOW(), updated_at = NOW() WHERE slug = 'bba' AND duration = '4 Years';
UPDATE programs SET source_url = 'https://portal.tu.edu.np/downloads/BBSFirstyearSyllabusandQu_2023_2023_06_18_21_34_27.pdf', last_verified_at = NOW(), updated_at = NOW() WHERE slug = 'bbs' AND duration = '4 Years';
