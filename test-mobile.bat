@echo off
echo ========================================
echo    اختبار التطبيق على الهاتف المحمول
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
echo افتح المتصفح على الهاتف واذهب إلى:
echo http://%ip%:8000
echo.
echo أو جرب:
echo http://localhost:8000
echo.

echo اضغط Ctrl+C لإيقاف الخادم
echo.

REM تشغيل الخادم
python -m http.server 8000 --bind 0.0.0.0

pause
