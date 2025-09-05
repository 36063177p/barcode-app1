-- إصلاح قاعدة البيانات - إضافة العمود المفقود
-- نفذ هذا في Supabase SQL Editor

-- إضافة عمود updated_at إلى جدول sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- تحديث العمود للسجلات الموجودة
UPDATE sessions SET updated_at = created_at WHERE updated_at IS NULL;

-- إنشاء أو تحديث الدالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء أو تحديث المشغل
DROP TRIGGER IF EXISTS trigger_update_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- التحقق من النتيجة
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND column_name = 'updated_at';

-- عرض هيكل الجدول الكامل للتأكد
\d sessions;
