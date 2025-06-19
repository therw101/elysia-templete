-- =================================================================
-- Database Setup Script with Sample Data
-- =================================================================

-- เรียกใช้ schema หลัก
\i database/schema.sql

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO users (email, username, password_hash, first_name, last_name, phone_number, role) VALUES
-- Admin user (password: admin123)
('admin@rmu.ac.th', 'admin', '$2b$10$K8yJZ8MQC5WJGx.oE8vSoOQZhPQPkZhKJYmPGqJRQ5aKkPJMSKCqC', 'ผู้ดูแล', 'ระบบ', '0612345678', 'ADMIN'),

-- Student users (password: student123)
('student1@rmu.ac.th', 'student1', '$2b$10$rQZ9j5W7X6E5H1Y4V8P2S.oE8vSoOQZhPQPkZhKJYmPGqJRQ5aKkPC', 'สมชาย', 'ใจดี', '0812345678', 'STUDENT'),
('student2@rmu.ac.th', 'student2', '$2b$10$rQZ9j5W7X6E5H1Y4V8P2S.oE8vSoOQZhPQPkZhKJYmPGqJRQ5aKkPC', 'สมหญิง', 'ขยัน', '0823456789', 'STUDENT'),

-- Employer users (password: employer123)
('employer1@company.com', 'company1', '$2b$10$tRZ9j5W7X6E5H1Y4V8P2T.oE8vSoOQZhPQPkZhKJYmPGqJRQ5aKkQC', 'นายจ้าง', 'ดีใจ', '0834567890', 'EMPLOYER'),
('employer2@business.com', 'business1', '$2b$10$tRZ9j5W7X6E5H1Y4V8P2T.oE8vSoOQZhPQPkZhKJYmPGqJRQ5aKkQC', 'เจ้าของกิจการ', 'มั่งมี', '0845678901', 'EMPLOYER');

-- เพิ่ม student profiles
INSERT INTO student_profiles (user_id, student_id, year_of_study, major, faculty, gpa, skills, bio) VALUES
((SELECT id FROM users WHERE username = 'student1'), '63001234', 3, 'วิทยาการคอมพิวเตอร์', 'วิทยาศาสตร์และเทคโนโลยี', 3.25, ARRAY['JavaScript', 'Python', 'React'], 'นักศึกษาที่ชอบเรียนรู้เทคโนโลยีใหม่ๆ'),
((SELECT id FROM users WHERE username = 'student2'), '63001235', 2, 'การจัดการ', 'บริหารธุรกิจ', 3.50, ARRAY['Marketing', 'Social Media', 'Excel'], 'นักศึกษาที่สนใจด้านการตลาดและการจัดการ');

-- เพิ่ม employer profiles
INSERT INTO employer_profiles (user_id, company_name, company_description, industry, website_url, address, contact_person) VALUES
((SELECT id FROM users WHERE username = 'company1'), 'บริษัท เทคโนโลยี จำกัด', 'บริษัทพัฒนาซอฟต์แวร์และเว็บไซต์', 'เทคโนโลยีสารสนเทศ', 'https://tech-company.com', '123 ถนนเทคโนโลยี กรุงเทพฯ', 'คุณสมชาย'),
((SELECT id FROM users WHERE username = 'business1'), 'ร้านกาแฟ เฮ้าส์', 'ร้านกาแฟและเบเกอรี่', 'อาหารและเครื่องดื่ม', 'https://coffeehouse.com', '456 ถนนกาแฟ มหาสารคาม', 'คุณสมหญิง');

-- เพิ่มงานตัวอย่าง
INSERT INTO jobs (employer_id, title, description, requirements, location, salary_min, salary_max, work_type, duration, start_date, end_date, application_deadline, max_applications, status) VALUES
((SELECT id FROM users WHERE username = 'company1'), 'Frontend Developer Intern', 'ฝึกงานพัฒนาเว็บไซต์ด้วย React และ TypeScript', 'มีความรู้พื้นฐาน HTML, CSS, JavaScript', 'กรุงเทพฯ / Work from Home', 15000.00, 20000.00, 'INTERNSHIP', '3 เดือน', '2024-06-01', '2024-08-31', '2024-05-15', 5, 'PUBLISHED'),

((SELECT id FROM users WHERE username = 'business1'), 'Barista Part-time', 'ทำงานเป็นบาริสต้าในร้านกาแฟ', 'รักการบริการ สามารถทำงานเป็นทีมได้', 'มหาสารคาม', 150.00, 180.00, 'PART_TIME', 'ชั่วคราว', '2024-04-01', '2024-12-31', '2024-03-25', 3, 'PUBLISHED'),

((SELECT id FROM users WHERE username = 'company1'), 'Data Entry Clerk', 'ป้อนข้อมูลและจัดการเอกสาร', 'ใช้ Excel ได้ ทำงานละเอียดรอบคอบ', 'กรุงเทพฯ', 12000.00, 15000.00, 'PART_TIME', '6 เดือน', '2024-05-01', '2024-10-31', '2024-04-20', 10, 'PUBLISHED');

-- เพิ่มใบสมัครงานตัวอย่าง
INSERT INTO applications (job_id, student_id, cover_letter, status) VALUES
((SELECT id FROM jobs WHERE title = 'Frontend Developer Intern'), (SELECT id FROM users WHERE username = 'student1'), 'สวัสดีครับ ผมสนใจงานฝึกงาน Frontend Developer เพราะมีความรู้ด้าน JavaScript และ React อยากเรียนรู้เพิ่มเติม', 'PENDING'),
((SELECT id FROM jobs WHERE title = 'Barista Part-time'), (SELECT id FROM users WHERE username = 'student2'), 'สวัสดีค่ะ ดิฉันสนใจงาน Barista เพราะชอบกาแฟและรักการบริการลูกค้า', 'REVIEWED'),
((SELECT id FROM jobs WHERE title = 'Data Entry Clerk'), (SELECT id FROM users WHERE username = 'student1'), 'ผมมีประสบการณ์การใช้ Excel และมีความละเอียดรอบคอบ เหมาะกับงานนี้', 'PENDING');

-- แสดงสถิติข้อมูลที่เพิ่ม
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Student Profiles', COUNT(*) FROM student_profiles
UNION ALL  
SELECT 'Employer Profiles', COUNT(*) FROM employer_profiles
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications;

PRINT 'Database setup completed with sample data!'; 