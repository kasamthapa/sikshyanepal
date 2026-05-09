-- ============================================================
-- SikshyaNepal - Realistic Seed Data
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- COLLEGES
-- ============================================================
INSERT INTO colleges (name, slug, description, location, address, phone, email, website, affiliation, established_year, is_featured) VALUES

('Thames International College',
 'thames-international-college',
 'Thames International College is one of Kathmandu''s premier private colleges offering BIT, BCA, BBA, and BSc CSIT under Tribhuvan University affiliation. Known for its strong IT faculty, modern computer labs, and high placement rates in the IT sector.',
 'Kathmandu', 'Baneshwor, Kathmandu 44600', '01-4782354', 'info@thames.edu.np', 'https://thames.edu.np',
 'Tribhuvan University', 2003, true),

('DAV College',
 'dav-college',
 'Dayananda Anglo Vedic (DAV) College is a well-established institution in Kathmandu offering management and humanities programs. Affiliated with Tribhuvan University, it is known for its experienced faculty and affordable education.',
 'Kathmandu', 'Maitidevi, Kathmandu 44600', '01-4413758', 'info@davcollege.edu.np', 'https://davcollege.edu.np',
 'Tribhuvan University', 1991, true),

('Kathford International College of Engineering and Management',
 'kathford-international-college',
 'Kathford is a leading KU-affiliated college offering BE programs in Computer, Civil, and Electronics engineering. It features state-of-the-art engineering labs, a dedicated placement cell, and strong industry partnerships.',
 'Kathmandu', 'Balkumari, Lalitpur 44700', '01-5170066', 'info@kathford.edu.np', 'https://kathford.edu.np',
 'Kathmandu University', 2009, true),

('ISMT College',
 'ismt-college',
 'ISMT College is a pioneering institution affiliated with Pokhara University, specializing in management, IT, and travel & tourism programs. Located in central Kathmandu with experienced faculty and industry-focused curriculum.',
 'Kathmandu', 'Kamaladi, Kathmandu 44600', '01-4248183', 'info@ismt.edu.np', 'https://ismt.edu.np',
 'Pokhara University', 2001, true),

('Softwarica College of IT and E-Commerce',
 'softwarica-college',
 'Softwarica College is a leading IT college in Nepal affiliated with Pokhara University. Known for its specialized focus on software engineering, e-commerce, and emerging technologies with strong placements in the tech industry.',
 'Kathmandu', 'Dillibazar, Kathmandu 44600', '01-4436600', 'info@softwarica.edu.np', 'https://softwarica.edu.np',
 'Pokhara University', 2012, true),

('Manipal College of Medical Sciences',
 'manipal-college-of-medical-sciences',
 'Manipal College of Medical Sciences (MCOMS) is one of Nepal''s most prestigious medical colleges located in Pokhara. Affiliated with Kathmandu University, it offers MBBS, B.Pharm, and nursing programs with world-class facilities.',
 'Pokhara', 'Phulbari, Pokhara 33700', '061-526416', 'info@manipal.edu.np', 'https://manipal.edu.np',
 'Kathmandu University', 1994, true),

('Gandaki Medical College',
 'gandaki-medical-college',
 'Gandaki Medical College and Teaching Hospital is a reputed medical institution in Pokhara affiliated with Tribhuvan University. It offers MBBS with strong clinical training at its attached teaching hospital.',
 'Pokhara', 'Lamachour, Pokhara 33700', '061-521233', 'info@gmc.edu.np', 'https://gmc.edu.np',
 'Tribhuvan University', 2008, false),

('Lumbini Medical College',
 'lumbini-medical-college',
 'Lumbini Medical College and Teaching Hospital is a TU-affiliated medical college located in Palpa. It provides quality MBBS education with modern medical facilities and strong clinical exposure.',
 'Palpa', 'Pravas, Tansen, Palpa 32500', '075-524234', 'info@lmcth.edu.np', 'https://lmcth.edu.np',
 'Tribhuvan University', 2007, false),

('Chitwan Medical College',
 'chitwan-medical-college',
 'Chitwan Medical College (CMC) is a well-established medical college in Bharatpur affiliated with Tribhuvan University. It features a 1000-bed teaching hospital with specialties across major medical disciplines.',
 'Bharatpur', 'Bharatpur-10, Chitwan 44200', '056-527229', 'info@cmc.edu.np', 'https://cmc.edu.np',
 'Tribhuvan University', 2009, true),

('Nobel Medical College',
 'nobel-medical-college',
 'Nobel Medical College and Teaching Hospital is a leading medical institution in Biratnagar affiliated with Kathmandu University. It is the first private medical college in Province No. 1 and offers MBBS and nursing programs.',
 'Biratnagar', 'Biratnagar-10, Morang 56613', '021-470100', 'info@nobelmedicalcollege.edu.np', 'https://nobelmedicalcollege.edu.np',
 'Kathmandu University', 2008, false),

('Herald College Kathmandu',
 'herald-college-kathmandu',
 'Herald College Kathmandu is a prestigious institution offering internationally-recognized IT and management programs in partnership with the University of Wolverhampton, UK. Known for innovative teaching methods.',
 'Kathmandu', 'Naxal, Kathmandu 44600', '01-4537555', 'info@heraldcollege.edu.np', 'https://heraldcollege.edu.np',
 'Tribhuvan University', 2009, false),

('Apex College',
 'apex-college',
 'Apex College is a reputed institution affiliated with Pokhara University offering BBA, MBA, BCA, and other programs. Known for quality management education, experienced faculty, and strong alumni network across Nepal.',
 'Kathmandu', 'Sundhara, Kathmandu 44600', '01-4260823', 'info@apexcollege.edu.np', 'https://apexcollege.edu.np',
 'Pokhara University', 2003, false),

('Texas International College',
 'texas-international-college',
 'Texas International College is a dynamic institution affiliated with Pokhara University offering BCA, BBA, and IT programs. It focuses on practical, industry-relevant education with modern computer labs and business simulations.',
 'Kathmandu', 'Kalanki, Kathmandu 44600', '01-4279145', 'info@texascollege.edu.np', 'https://texascollege.edu.np',
 'Pokhara University', 2006, false),

('Informatics College Pokhara',
 'informatics-college-pokhara',
 'Informatics College Pokhara is the first IT college in the Gandaki Province affiliated with Pokhara University. It offers BCA, BIT, and BBA programs with a focus on hands-on technical training and entrepreneurship.',
 'Pokhara', 'Chipledhunga, Pokhara 33700', '061-537620', 'info@informatics.edu.np', 'https://informatics.edu.np',
 'Pokhara University', 2001, false),

('Greenland International College',
 'greenland-international-college',
 'Greenland International College is a premier institution in Biratnagar affiliated with Pokhara University. It offers BBA and BCA programs with a focus on practical business skills and regional industry connections.',
 'Biratnagar', 'Biratnagar-2, Morang 56613', '021-523550', 'info@greenlandcollege.edu.np', 'https://greenlandcollege.edu.np',
 'Pokhara University', 2004, false),

('Kathmandu Model College',
 'kathmandu-model-college',
 'Kathmandu Model College (KMC) is one of the oldest and most reputed colleges in Nepal affiliated with Tribhuvan University. It offers a wide range of programs in Management, Humanities, and Science with highly experienced faculty.',
 'Kathmandu', 'Bagbazar, Kathmandu 44600', '01-4246694', 'info@kmc.edu.np', 'https://kmc.edu.np',
 'Tribhuvan University', 1964, false),

('Prime College',
 'prime-college',
 'Prime College is a leading TU-affiliated institution in Kathmandu offering BBA, BCA, BSc CSIT, and BIT programs. Known for its CSIT program with strong placement in IT companies and modern computing infrastructure.',
 'Kathmandu', 'Nayabazar, Kathmandu 44600', '01-4352073', 'info@primecollege.edu.np', 'https://primecollege.edu.np',
 'Tribhuvan University', 2002, false),

('NIST College',
 'nist-college',
 'NIST College is an established institution affiliated with Pokhara University offering BCA, BBA, and BIT programs. It is renowned for its focus on student development, research activities, and industry collaboration.',
 'Kathmandu', 'Khusibu, Kathmandu 44600', '01-4389909', 'info@nist.edu.np', 'https://nist.edu.np',
 'Pokhara University', 2002, false),

('Pokhara Engineering College',
 'pokhara-engineering-college',
 'Pokhara Engineering College (PEC) is a top engineering college affiliated with Pokhara University in the Gandaki Province. It offers BE programs in Computer, Civil, and Electronics Engineering with modern engineering facilities.',
 'Pokhara', 'Manamaiju, Pokhara 33700', '061-531842', 'info@pec.edu.np', 'https://pec.edu.np',
 'Pokhara University', 2005, false),

('Itahari International College',
 'itahari-international-college',
 'Itahari International College (IIC) is the leading educational institution in eastern Nepal affiliated with Pokhara University. It offers BCA, BBA, and BIT programs serving students from Province No. 1 and beyond.',
 'Itahari', 'Itahari-7, Sunsari 56705', '025-586688', 'info@iic.edu.np', 'https://iic.edu.np',
 'Pokhara University', 2008, false),

('Madan Bhandari Memorial College',
 'madan-bhandari-memorial-college',
 'Madan Bhandari Memorial College is a government-supported TU-affiliated college in Kathmandu offering affordable quality education in management and humanities. Named after the late political leader Madan Bhandari.',
 'Kathmandu', 'Urlabari, Morang 56705', '021-450177', 'info@mbmc.edu.np', 'https://mbmc.edu.np',
 'Tribhuvan University', 1996, false),

('Orchid International College',
 'orchid-international-college',
 'Orchid International College is a TU-affiliated engineering college in Kathmandu offering BE programs in Civil and Computer engineering. It features well-equipped labs, dedicated project rooms, and strong faculty.',
 'Kathmandu', 'Gaushala, Kathmandu 44600', '01-4473333', 'info@orchid.edu.np', 'https://orchid.edu.np',
 'Tribhuvan University', 2010, false)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- COLLEGE PROGRAMS (fees in NPR per year)
-- ============================================================

-- Thames International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 150000, 72, true FROM colleges c, programs p WHERE c.slug = 'thames-international-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 175000, 60, true FROM colleges c, programs p WHERE c.slug = 'thames-international-college' AND p.slug = 'bsc-csit' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 160000, 60, false FROM colleges c, programs p WHERE c.slug = 'thames-international-college' AND p.slug = 'bit' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 145000, 60, true FROM colleges c, programs p WHERE c.slug = 'thames-international-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;

-- DAV College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 95000, 120, true FROM colleges c, programs p WHERE c.slug = 'dav-college' AND p.slug = 'bbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 120000, 80, false FROM colleges c, programs p WHERE c.slug = 'dav-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 75000, 100, false FROM colleges c, programs p WHERE c.slug = 'dav-college' AND p.slug = 'ba' ON CONFLICT DO NOTHING;

-- Kathford International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 385000, 48, true FROM colleges c, programs p WHERE c.slug = 'kathford-international-college' AND p.slug = 'be-computer' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 365000, 48, true FROM colleges c, programs p WHERE c.slug = 'kathford-international-college' AND p.slug = 'be-civil' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 370000, 48, false FROM colleges c, programs p WHERE c.slug = 'kathford-international-college' AND p.slug = 'be-electronics' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 175000, 60, true FROM colleges c, programs p WHERE c.slug = 'kathford-international-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 195000, 60, false FROM colleges c, programs p WHERE c.slug = 'kathford-international-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;

-- ISMT College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 140000, 72, true FROM colleges c, programs p WHERE c.slug = 'ismt-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 155000, 60, false FROM colleges c, programs p WHERE c.slug = 'ismt-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 350000, 36, true FROM colleges c, programs p WHERE c.slug = 'ismt-college' AND p.slug = 'mba' ON CONFLICT DO NOTHING;

-- Softwarica College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 165000, 72, true FROM colleges c, programs p WHERE c.slug = 'softwarica-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 185000, 60, true FROM colleges c, programs p WHERE c.slug = 'softwarica-college' AND p.slug = 'bsc-csit' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 170000, 60, false FROM colleges c, programs p WHERE c.slug = 'softwarica-college' AND p.slug = 'bit' ON CONFLICT DO NOTHING;

-- Manipal College of Medical Sciences
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 1150000, 100, true FROM colleges c, programs p WHERE c.slug = 'manipal-college-of-medical-sciences' AND p.slug = 'mbbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 320000, 60, false FROM colleges c, programs p WHERE c.slug = 'manipal-college-of-medical-sciences' AND p.slug = 'bpharm' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 215000, 80, true FROM colleges c, programs p WHERE c.slug = 'manipal-college-of-medical-sciences' AND p.slug = 'bnursing' ON CONFLICT DO NOTHING;

-- Gandaki Medical College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 950000, 100, true FROM colleges c, programs p WHERE c.slug = 'gandaki-medical-college' AND p.slug = 'mbbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 185000, 60, false FROM colleges c, programs p WHERE c.slug = 'gandaki-medical-college' AND p.slug = 'bnursing' ON CONFLICT DO NOTHING;

-- Lumbini Medical College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 875000, 100, true FROM colleges c, programs p WHERE c.slug = 'lumbini-medical-college' AND p.slug = 'mbbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 175000, 50, false FROM colleges c, programs p WHERE c.slug = 'lumbini-medical-college' AND p.slug = 'bnursing' ON CONFLICT DO NOTHING;

-- Chitwan Medical College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 980000, 100, true FROM colleges c, programs p WHERE c.slug = 'chitwan-medical-college' AND p.slug = 'mbbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 290000, 60, false FROM colleges c, programs p WHERE c.slug = 'chitwan-medical-college' AND p.slug = 'bpharm' ON CONFLICT DO NOTHING;

-- Nobel Medical College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 1050000, 100, true FROM colleges c, programs p WHERE c.slug = 'nobel-medical-college' AND p.slug = 'mbbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 200000, 60, true FROM colleges c, programs p WHERE c.slug = 'nobel-medical-college' AND p.slug = 'bnursing' ON CONFLICT DO NOTHING;

-- Herald College Kathmandu
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 260000, 60, true FROM colleges c, programs p WHERE c.slug = 'herald-college-kathmandu' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 250000, 60, false FROM colleges c, programs p WHERE c.slug = 'herald-college-kathmandu' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 270000, 60, false FROM colleges c, programs p WHERE c.slug = 'herald-college-kathmandu' AND p.slug = 'bit' ON CONFLICT DO NOTHING;

-- Apex College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 165000, 72, true FROM colleges c, programs p WHERE c.slug = 'apex-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 155000, 60, false FROM colleges c, programs p WHERE c.slug = 'apex-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 420000, 40, true FROM colleges c, programs p WHERE c.slug = 'apex-college' AND p.slug = 'mba' ON CONFLICT DO NOTHING;

-- Texas International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 135000, 72, true FROM colleges c, programs p WHERE c.slug = 'texas-international-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 145000, 60, false FROM colleges c, programs p WHERE c.slug = 'texas-international-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;

-- Informatics College Pokhara
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 120000, 72, true FROM colleges c, programs p WHERE c.slug = 'informatics-college-pokhara' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 140000, 60, false FROM colleges c, programs p WHERE c.slug = 'informatics-college-pokhara' AND p.slug = 'bit' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 130000, 60, true FROM colleges c, programs p WHERE c.slug = 'informatics-college-pokhara' AND p.slug = 'bba' ON CONFLICT DO NOTHING;

-- Greenland International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 105000, 60, true FROM colleges c, programs p WHERE c.slug = 'greenland-international-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 115000, 60, false FROM colleges c, programs p WHERE c.slug = 'greenland-international-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;

-- Kathmandu Model College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 70000, 200, true FROM colleges c, programs p WHERE c.slug = 'kathmandu-model-college' AND p.slug = 'bbs' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 65000, 150, false FROM colleges c, programs p WHERE c.slug = 'kathmandu-model-college' AND p.slug = 'ba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 80000, 120, true FROM colleges c, programs p WHERE c.slug = 'kathmandu-model-college' AND p.slug = 'bsc' ON CONFLICT DO NOTHING;

-- Prime College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 155000, 72, true FROM colleges c, programs p WHERE c.slug = 'prime-college' AND p.slug = 'bsc-csit' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 145000, 72, true FROM colleges c, programs p WHERE c.slug = 'prime-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 150000, 60, false FROM colleges c, programs p WHERE c.slug = 'prime-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 148000, 60, false FROM colleges c, programs p WHERE c.slug = 'prime-college' AND p.slug = 'bit' ON CONFLICT DO NOTHING;

-- NIST College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 138000, 72, true FROM colleges c, programs p WHERE c.slug = 'nist-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 148000, 60, false FROM colleges c, programs p WHERE c.slug = 'nist-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 142000, 60, true FROM colleges c, programs p WHERE c.slug = 'nist-college' AND p.slug = 'bit' ON CONFLICT DO NOTHING;

-- Pokhara Engineering College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 310000, 48, true FROM colleges c, programs p WHERE c.slug = 'pokhara-engineering-college' AND p.slug = 'be-computer' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 295000, 48, true FROM colleges c, programs p WHERE c.slug = 'pokhara-engineering-college' AND p.slug = 'be-civil' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 300000, 48, false FROM colleges c, programs p WHERE c.slug = 'pokhara-engineering-college' AND p.slug = 'be-electronics' ON CONFLICT DO NOTHING;

-- Itahari International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 110000, 72, true FROM colleges c, programs p WHERE c.slug = 'itahari-international-college' AND p.slug = 'bca' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 125000, 60, false FROM colleges c, programs p WHERE c.slug = 'itahari-international-college' AND p.slug = 'bba' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 118000, 60, true FROM colleges c, programs p WHERE c.slug = 'itahari-international-college' AND p.slug = 'bit' ON CONFLICT DO NOTHING;

-- Orchid International College
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 340000, 48, true FROM colleges c, programs p WHERE c.slug = 'orchid-international-college' AND p.slug = 'be-computer' ON CONFLICT DO NOTHING;
INSERT INTO college_programs (college_id, program_id, fee, seats, scholarship_available)
SELECT c.id, p.id, 325000, 48, false FROM colleges c, programs p WHERE c.slug = 'orchid-international-college' AND p.slug = 'be-civil' ON CONFLICT DO NOTHING;


-- ============================================================
-- NEWS ARTICLES
-- ============================================================
INSERT INTO news (title, slug, content, author, published_date) VALUES

('TU Announces Online Admission for 2081 Academic Session',
 'tu-online-admission-2081',
 'Tribhuvan University has announced that admissions for the 2081 academic year will be processed entirely through its online portal. Students seeking enrollment in undergraduate programs including BBS, BA, BSc, and B.Ed. must apply through the official TU website. The university is accepting applications from Shrawan 1 to Bhadra 15, 2081. Applicants must upload their SLC/SEE and +2 mark sheets, citizenship documents, and passport-size photographs. TU Vice-Chancellor Prof. Dr. Keshar Jung Baral urged students to complete the application process early to avoid last-minute issues. The admission committee will publish the merit list within two weeks of the application deadline.',
 'SikshyaNepal Editorial Team', NOW() - INTERVAL '2 days'),

('KU Entrance Exam Results Published — Check Your Score Now',
 'ku-entrance-exam-results-2081',
 'Kathmandu University has published the results of its undergraduate entrance examination for the 2081 academic session. Students who appeared in the entrance test for BE, BPH, BAMS, and BBA programs can now check their results on the official KU website at ku.edu.np. The university conducted the entrance examination at various centers across Nepal including Kathmandu, Pokhara, Biratnagar, and Butwal. KU will be offering 480 seats in engineering programs this year. Successful candidates must complete the enrollment process within 15 days of the result publication. Students scoring in the top 10% of each program will be eligible for merit-based fee waivers.',
 'SikshyaNepal Editorial Team', NOW() - INTERVAL '5 days'),

('NEB Grade 12 Results 2080 — Record Pass Rate Reported',
 'neb-grade-12-results-2080',
 'The National Examinations Board (NEB) has released the Grade 12 (Class 12) results for the 2080 examination. This year, a record 82.47% of students passed the examination, the highest pass rate in the past five years. Science stream students achieved a 79.3% pass rate while management students had an 84.6% pass rate. A total of 4,23,891 students appeared in the exam from 1,482 examination centers across Nepal. Pokhara district topped the national pass percentage at 89.2%. Students can check their results through the NEB website, SMS service, or through their respective schools. Those who failed in one or two subjects can apply for partial re-examination.',
 'SikshyaNepal Editorial Team', NOW() - INTERVAL '10 days'),

('Medical College Fee Structure Regulated by Supreme Court Order',
 'supreme-court-medical-fee-regulation',
 'The Supreme Court of Nepal has issued a landmark order directing the government to strictly regulate medical college fees. Following a public interest litigation filed by medical student groups, the court has ordered the Medical Education Commission (MEC) to cap annual MBBS fees at NPR 12 lakh for private medical colleges. The ruling also mandates that 20% of seats in all private medical colleges must be reserved for economically disadvantaged students at subsidized rates. Medical college owners have been given 30 days to comply with the new fee structure. The Nepal Medical Association has welcomed the decision, calling it a "historic step" toward making medical education more accessible to ordinary Nepali families.',
 'SikshyaNepal Editorial Team', NOW() - INTERVAL '15 days'),

('Scholarship Opportunities for Nepali Students in 2081 — Complete Guide',
 'nepal-scholarship-guide-2081',
 'As the 2081 academic year begins, SikshyaNepal has compiled a comprehensive list of scholarship opportunities available to Nepali students across different levels and programs. The Government of Nepal is offering 500 fully-funded scholarships through various universities including TU, KU, PU, and PurU for undergraduate programs. Additionally, several private colleges have announced merit-based scholarships covering 25% to 100% of tuition fees. International scholarships from countries including India (ICCR), China (CSC), Japan (MEXT), and Korea (GKS) are also open for applications. Students with GPA above 3.5 in their +2 examinations are encouraged to apply. SikshyaNepal will be hosting a free scholarship counseling session in Kathmandu next month.',
 'SikshyaNepal Editorial Team', NOW() - INTERVAL '20 days')

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- NOTICES
-- ============================================================
INSERT INTO notices (title, slug, content, university_id, notice_url, published_date) VALUES

('TU BBS 4th Year Examination Form Fill-Up Notice',
 'tu-bbs-4th-year-form-fillup-2081',
 'Tribhuvan University, Office of the Controller of Examinations, hereby notifies all regular and partial students of BBS 4th Year that the examination form fill-up for the 2080 academic year examination has commenced. Students must submit their examination forms along with the required fees at their respective campuses. The deadline for regular form submission is Bhadra 25, 2081. Late submission with additional fee will be accepted until Ashoj 5, 2081. Students who have not cleared their back papers from previous years must also indicate this on their form. Results of the examination will be published within 90 days of the last exam date.',
 (SELECT id FROM universities WHERE short_name = 'TU'), NULL, NOW() - INTERVAL '1 day'),

('KU School of Engineering — Undergraduate Admission Notice 2081',
 'ku-engineering-admission-2081',
 'Kathmandu University, School of Engineering, invites applications from qualified Nepali and international students for undergraduate BE programs in the following disciplines: Computer Engineering, Electrical Engineering, Civil Engineering, Mechanical Engineering, and Geomatics Engineering for the 2081 academic session. Eligibility: Minimum 60% in Grade 12 (or equivalent) with Physics, Chemistry, and Mathematics. Entrance examination will be held on Ashad 20, 2081 at KU main campus Dhulikhel and satellite centers in Kathmandu, Pokhara, and Biratnagar. Application fee: NPR 1,500. Applications can be submitted online at admission.ku.edu.np.',
 (SELECT id FROM universities WHERE short_name = 'KU'), 'https://ku.edu.np/admission', NOW() - INTERVAL '3 days'),

('TU MSc CSIT Entrance Examination Result Published',
 'tu-msc-csit-entrance-result-2081',
 'The Institute of Science and Technology (IOST), Tribhuvan University, has published the entrance examination results for MSc CSIT program for the 2081 academic year. Students can check their results on the IOST website at iost.tu.edu.np. A total of 1,247 students appeared in the entrance examination held on Jestha 28, 2081. Successful candidates must report to the respective campuses with all original documents within 10 days of result publication. The program will commence from Shrawan 15, 2081. Students are advised to contact their preferred campus directly for seat availability.',
 (SELECT id FROM universities WHERE short_name = 'TU'), 'https://iost.tu.edu.np', NOW() - INTERVAL '6 days'),

('KU Notice Regarding Semester End Examination Postponement',
 'ku-semester-end-exam-postponement',
 'Kathmandu University has decided to postpone the Semester End Examination (SEE) for all undergraduate and postgraduate programs originally scheduled for Shrawan 2081 due to the ongoing monsoon disruption affecting transportation across the country. The revised examination schedule will be published within seven days. Students are advised to continue their preparation and watch the university''s official website and notice boards for updates. The university regrets any inconvenience caused and assures that all students will be given adequate notice before the rescheduled examinations commence.',
 (SELECT id FROM universities WHERE short_name = 'KU'), NULL, NOW() - INTERVAL '8 days'),

('TU Faculty of Management — Annual Examination Schedule 2081',
 'tu-management-exam-schedule-2081',
 'The Office of the Dean, Faculty of Management, Tribhuvan University, hereby publishes the annual examination schedule for BBS, BBA, BBM, and MBS programs for the 2080 batch (Academic Year 2081). The examinations will be conducted from Kartik 5 to Mangsir 15, 2081. Practical examinations and viva voce will be conducted separately as per departmental schedules. All students are advised to obtain their admit cards from their respective campuses one week before the examination commencement. Students are not allowed to enter the examination hall without a valid admit card.',
 (SELECT id FROM universities WHERE short_name = 'TU'), 'https://fom.tu.edu.np', NOW() - INTERVAL '12 days'),

('KU Scholarship Announcement for Meritorious Students 2081',
 'ku-scholarship-announcement-2081',
 'Kathmandu University announces the availability of merit-based scholarships for students enrolling in engineering, medical, and management programs for the academic year 2081. Students who have secured distinction in their Grade 12 examination (GPA 3.6 and above or percentage 75% and above) are eligible to apply. Full scholarships (100% fee waiver) will be awarded to the top 5 students of each major program. Partial scholarships (25% to 50% fee waiver) will be given to students ranking 6th to 20th. Applications must be submitted within 15 days of admission confirmation. Contact the scholarship office at KU main campus for further information.',
 (SELECT id FROM universities WHERE short_name = 'KU'), 'https://ku.edu.np/scholarship', NOW() - INTERVAL '14 days'),

('TU MBBS First Year Examination Date Announcement',
 'tu-mbbs-first-year-exam-2081',
 'The Tribhuvan University, Institute of Medicine (IOM), hereby announces that the first year MBBS (Pre-clinical) examinations for the 2079 batch will be held from Kartik 15 to Mangsir 5, 2081. All medical colleges affiliated with TU-IOM must ensure that eligible students collect their admit cards from the Dean''s office at least 14 days before the examination. Students with attendance below 75% are not eligible to appear in the examination and must repeat the academic year. The examination centers will be published separately. For queries, contact the IOM office at iom.tu.edu.np.',
 (SELECT id FROM universities WHERE short_name = 'TU'), 'https://iom.tu.edu.np', NOW() - INTERVAL '18 days'),

('KU Dhulikhel Hospital — Medical Internship Program Announcement',
 'ku-medical-internship-2081',
 'Kathmandu University School of Medical Sciences (KUSMS) and Dhulikhel Hospital invite applications from final year MBBS students for rotating internship positions. The internship program covers all major clinical departments including Internal Medicine, Surgery, Obstetrics and Gynecology, Pediatrics, and Psychiatry. The one-year internship is mandatory for MBBS graduates before appearing in the Nepal Medical Council (NMC) licensing examination. Interested students should submit their applications along with transcripts and completed MBBS degree to the KUSMS Dean''s office by Bhadra 30, 2081.',
 (SELECT id FROM universities WHERE short_name = 'KU'), 'https://ku.edu.np/kusms', NOW() - INTERVAL '21 days'),

('TU BE (Computer/Civil/Electronics) First Year Admission Notice',
 'tu-be-first-year-admission-2081',
 'Institute of Engineering (IOE), Tribhuvan University, announces undergraduate BE admissions for the 2081/82 academic year. Programs offered: Computer, Civil, Electronics & Communication, Electrical, Architecture, and Mechanical Engineering. Entrance examination (IOE Entrance Exam) will be held across examination centers in all 7 provinces. The exam syllabus covers Physics, Chemistry, and Mathematics at +2 level. Registration deadline: Ashadh 10, 2081. Exam date: Ashadh 28, 2081. Results: Shrawan 10, 2081. Students are advised to register early as late registrations will not be entertained.',
 (SELECT id FROM universities WHERE short_name = 'TU'), 'https://ioe.tu.edu.np', NOW() - INTERVAL '25 days'),

('PU BCA/BBA Entrance Examination Notice 2081',
 'pu-bca-bba-entrance-2081',
 'Pokhara University, School of Business and affiliated colleges, announces that the entrance examination for BCA and BBA programs will be held on Shrawan 20, 2081. Students appearing in the entrance exam will be considered for admission to all PU-affiliated colleges across Nepal. The entrance test consists of 100 multiple choice questions covering English, Mathematics, and General Aptitude. Examination centers are available in Kathmandu, Pokhara, Biratnagar, Butwal, Itahari, and Dhangadhi. Registration fee: NPR 1,000. Apply online at pu.edu.np. Contact your nearest PU-affiliated college for assistance.',
 (SELECT id FROM universities WHERE short_name = 'PU'), 'https://pu.edu.np', NOW() - INTERVAL '28 days')

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- RESULTS
-- ============================================================
INSERT INTO results (title, slug, program, semester, year, university_id, result_url, published_date) VALUES

('TU BBS 4th Year Annual Examination Result 2080',
 'tu-bbs-4th-year-result-2080',
 'BBS', '4th Year', 2080,
 (SELECT id FROM universities WHERE short_name = 'TU'),
 'https://tucexam.edu.np/result', NOW() - INTERVAL '4 days'),

('KU BE Computer Engineering 7th Semester Result 2081',
 'ku-be-computer-7th-semester-2081',
 'BE Computer Engineering', '7th Semester', 2081,
 (SELECT id FROM universities WHERE short_name = 'KU'),
 'https://exam.ku.edu.np/result', NOW() - INTERVAL '9 days'),

('TU BCA 6th Semester Annual Examination Result 2080',
 'tu-bca-6th-semester-result-2080',
 'BCA', '6th Semester', 2080,
 (SELECT id FROM universities WHERE short_name = 'TU'),
 'https://tucexam.edu.np/result', NOW() - INTERVAL '15 days'),

('PU BBA 4th Semester End Examination Result 2080',
 'pu-bba-4th-semester-result-2080',
 'BBA', '4th Semester', 2080,
 (SELECT id FROM universities WHERE short_name = 'PU'),
 'https://pu.edu.np/result', NOW() - INTERVAL '22 days'),

('TU MBBS (IOM) First Professional Examination Result 2080',
 'tu-mbbs-first-professional-result-2080',
 'MBBS', '1st Year', 2080,
 (SELECT id FROM universities WHERE short_name = 'TU'),
 'https://iom.tu.edu.np/result', NOW() - INTERVAL '30 days')

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SCHOLARSHIPS
-- ============================================================
INSERT INTO scholarships (college_id, title, description, amount, deadline, eligibility, application_url, is_active) VALUES

((SELECT id FROM colleges WHERE slug = 'manipal-college-of-medical-sciences'),
 'MCOMS Merit Scholarship 2081',
 'Manipal College of Medical Sciences offers merit-based scholarships for top-ranking students in the KU entrance examination for the MBBS program. The scholarship covers 50% of the annual tuition fee for the entire 5.5-year duration, subject to maintaining a minimum GPA of 3.0 each year.',
 575000, NOW() + INTERVAL '60 days',
 'Top 10 rankers in KU entrance examination. Minimum 75% in Grade 12 Science. Nepali citizen.',
 'https://manipal.edu.np/scholarship', true),

((SELECT id FROM colleges WHERE slug = 'kathford-international-college'),
 'Kathford Engineering Excellence Scholarship',
 'Kathford International College awards full tuition waivers to exceptionally talented students in the IOE entrance examination. Recipients must maintain top academic standing throughout the 4-year BE program. The scholarship is renewable annually based on academic performance.',
 385000, NOW() + INTERVAL '45 days',
 'Top 5 rank in KU entrance examination for engineering. Minimum 70% in +2 with Physics, Chemistry, and Mathematics. Financial need may be considered.',
 'https://kathford.edu.np/scholarship', true),

((SELECT id FROM colleges WHERE slug = 'softwarica-college'),
 'Softwarica Women in Tech Scholarship',
 'Softwarica College is committed to increasing female participation in IT and offers a dedicated scholarship for women enrolling in BCA and BSc CSIT programs. The scholarship covers 40% of annual tuition fees and also includes free access to coding bootcamps and mentorship sessions.',
 74000, NOW() + INTERVAL '30 days',
 'Female students only. Minimum grade B+ in +2 Computer Science or Mathematics. Demonstrates interest in technology. Interview required.',
 'https://softwarica.edu.np/scholarship', true),

(NULL,
 'Government of Nepal Merit Scholarship 2081',
 'The Government of Nepal, Ministry of Education, offers fully-funded scholarships for meritorious students to pursue undergraduate education at TU, KU, PU, and other public universities across Nepal. This scholarship covers full tuition, examination fees, and a monthly stipend of NPR 3,000.',
 0, NOW() + INTERVAL '90 days',
 'GPA 3.6 or above in Grade 12 final examination. Nepali citizen under 25 years. Annual family income below NPR 3 lakhs. Must apply through the Ministry of Education portal.',
 'https://moest.gov.np/scholarship', true),

((SELECT id FROM colleges WHERE slug = 'prime-college'),
 'Prime College CSIT Merit Award 2081',
 'Prime College offers annual merit scholarships for the BSc CSIT program to students who have demonstrated academic excellence in their +2 Science examination. The award covers 30% of annual tuition fees and is renewable based on maintaining above 70% marks each semester.',
 46500, NOW() + INTERVAL '40 days',
 'Minimum 75% marks or GPA 3.5 in +2 Science (Physics, Chemistry, Mathematics). Must enroll in BSc CSIT at Prime College. Scholarship based on merit, not financial need.',
 'https://primecollege.edu.np/scholarship', true)

ON CONFLICT DO NOTHING;


-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (college_id, rating, review_text, student_name, program, year, is_approved) VALUES

((SELECT id FROM colleges WHERE slug = 'thames-international-college'),
 5, 'Thames is one of the best colleges for BCA in Kathmandu. The faculty members are very knowledgeable and always available for extra help. The computer labs have modern equipment and fast internet. The placement cell helped me get an internship at a reputed IT company in my 3rd year itself. Highly recommended for IT students!',
 'Suman Shrestha', 'BCA', 2024, true),

((SELECT id FROM colleges WHERE slug = 'thames-international-college'),
 4, 'Very good college overall. The BSc CSIT program curriculum is up to date with industry standards. Some faculty are excellent while others could be more engaging. The library resources are decent. The annual tech fest is a highlight every year. Would have given 5 stars if the canteen food quality was better!',
 'Priya Tamang', 'BSc CSIT', 2023, true),

((SELECT id FROM colleges WHERE slug = 'kathford-international-college'),
 5, 'Kathford is the best engineering college in Nepal outside of Pulchowk. The lab facilities for computer engineering are world-class. Professors are mostly PhD holders with industry experience. The project-based learning approach really prepares you for the real world. Got placed at a top IT company through campus recruitment.',
 'Aakash Gurung', 'BE Computer Engineering', 2024, true),

((SELECT id FROM colleges WHERE slug = 'kathford-international-college'),
 4, 'Great college for BE programs. KU affiliation means the degree is well recognized. The workload is heavy but worth it in the long run. The campus environment is clean and well-maintained. Transportation from Kathmandu is a bit challenging since it is in Balkumari but the college shuttle helps.',
 'Nisha Rai', 'BE Civil Engineering', 2023, true),

((SELECT id FROM colleges WHERE slug = 'manipal-college-of-medical-sciences'),
 5, 'MCOMS Pokhara is truly world-class. The clinical training at Manipal Teaching Hospital is exceptional with exposure to real cases from day one. The faculty includes specialists from India and abroad. Hostel facilities are comfortable. Yes, the fees are high but the quality of education and the KU degree makes it absolutely worth it.',
 'Dr. Bibek Karki', 'MBBS', 2024, true),

((SELECT id FROM colleges WHERE slug = 'softwarica-college'),
 4, 'Softwarica is a great choice for BCA in Kathmandu. The IT-focused environment keeps you motivated. Regular guest lectures from industry professionals are very helpful. The college actively promotes participation in hackathons and coding competitions. The batch sizes are smaller which means more individual attention from teachers.',
 'Anisha Magar', 'BCA', 2024, true),

((SELECT id FROM colleges WHERE slug = 'ismt-college'),
 4, 'ISMT is a reliable college for BCA and BBA. PU affiliation is well-regarded by employers. The management department is particularly strong. The campus in Kamaladi is conveniently located. Could improve on extracurricular activities and sports facilities. Overall a solid choice for management students.',
 'Roshan Adhikari', 'BBA', 2023, true),

((SELECT id FROM colleges WHERE slug = 'prime-college'),
 5, 'Prime College has an excellent BSc CSIT program. The department is well organized and the internal assessments keep you on track throughout the semester. The college has good connections with IT companies in Kathmandu for placements and internships. The environment is very student-friendly.',
 'Kapil Dev Poudel', 'BSc CSIT', 2024, true),

((SELECT id FROM colleges WHERE slug = 'chitwan-medical-college'),
 4, 'CMC provides quality medical education at relatively reasonable fees compared to Kathmandu colleges. The teaching hospital has good patient load giving students ample clinical exposure. Bharatpur city is calm and perfect for focused studying. Some departments need more specialist doctors but overall the training is solid.',
 'Dr. Sunita Bhattarai', 'MBBS', 2023, true),

((SELECT id FROM colleges WHERE slug = 'apex-college'),
 4, 'Apex College is a good PU-affiliated institution for MBA. The program structure is excellent and covers all aspects of modern business management. Faculty members are experienced practitioners from the industry. The networking opportunities with alumni are invaluable. Would recommend for working professionals wanting to upgrade their qualifications.',
 'Rajesh Basnet', 'MBA', 2024, true)

ON CONFLICT DO NOTHING;
