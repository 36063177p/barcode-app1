@echo off
echo ========================================
echo    تثبيت تطبيق الباركود كـ PWA
echo ========================================
echo.

echo جاري تشغيل الخادم المحلي...
echo.

REM الحصول على عنوان IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set ip=%%a
    goto :found
)
:found

REM تنظيف العنوان
set ip=%ip: =%

echo عنوان IP الخاص بك: %ip%
echo.
echo خطوات التثبيت:
echo.
echo 1. افتح المتصفح على الهاتف واذهب إلى:
echo    http://%ip%:8000
echo.
echo 2. في Chrome (Android):
echo    - اضغط على القائمة ⋮ في الأعلى
echo    - اختر "إضافة إلى الشاشة الرئيسية"
echo    - اضغط "إضافة"
echo.
echo 3. في Safari (iPhone):
echo    - اضغط على زر المشاركة 📤
echo    - اختر "إضافة إلى الشاشة الرئيسية"
echo    - اضغط "إضافة"
echo.
echo 4. ستظهر أيقونة التطبيق على الشاشة الرئيسية!
echo.

echo اضغط Ctrl+C لإيقاف الخادم
echo.

REM تشغيل الخادم
python -m http.server 8000 --bind 0.0.0.0

pause
