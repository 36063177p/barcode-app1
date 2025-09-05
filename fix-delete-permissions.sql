-- إصلاح أذونات الحذف في Supabase
-- نفذ هذا في SQL Editor

-- فحص السياسات الحالية
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('sessions', 'barcodes');

-- حذف السياسات القديمة إذا كانت تمنع الحذف
DROP POLICY IF EXISTS "Enable read access for all users" ON sessions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sessions;
DROP POLICY IF EXISTS "Enable update access for all users" ON sessions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sessions;

DROP POLICY IF EXISTS "Enable read access for all users" ON barcodes;
DROP POLICY IF EXISTS "Enable insert access for all users" ON barcodes;
DROP POLICY IF EXISTS "Enable update access for all users" ON barcodes;
DROP POLICY IF EXISTS "Enable delete access for all users" ON barcodes;

-- إنشاء سياسات جديدة شاملة لجميع العمليات
-- سياسات جدول sessions
CREATE POLICY "Allow all operations on sessions" ON sessions
    FOR ALL USING (true) WITH CHECK (true);

-- سياسات جدول barcodes
CREATE POLICY "Allow all operations on barcodes" ON barcodes
    FOR ALL USING (true) WITH CHECK (true);

-- أو يمكنك إنشاء سياسات منفصلة لكل عملية:

-- سياسات منفصلة لجدول sessions
-- CREATE POLICY "Enable read access for all users" ON sessions
--     FOR SELECT USING (true);

-- CREATE POLICY "Enable insert access for all users" ON sessions
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Enable update access for all users" ON sessions
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Enable delete access for all users" ON sessions
--     FOR DELETE USING (true);

-- سياسات منفصلة لجدول barcodes
-- CREATE POLICY "Enable read access for all users" ON barcodes
--     FOR SELECT USING (true);

-- CREATE POLICY "Enable insert access for all users" ON barcodes
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Enable update access for all users" ON barcodes
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Enable delete access for all users" ON barcodes
--     FOR DELETE USING (true);

-- التحقق من السياسات الجديدة
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('sessions', 'barcodes');

-- اختبار سريع للحذف
-- INSERT INTO sessions (user_id, client_name) VALUES ('test_delete', 'اختبار الحذف');
-- DELETE FROM sessions WHERE user_id = 'test_delete';

-- فحص Row Level Security
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('sessions', 'barcodes');

-- إذا كانت RLS معطلة، يمكنك تفعيلها:
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;
