@echo off
REM تشغيل تطبيق الباركود عند بدء النظام
REM ضع هذا الملف في مجلد Startup

echo بدء تشغيل تطبيق الباركود...

REM الانتقال لمجلد التطبيق
cd /d "D:\Idea2app\SEALS WITH BARCODE"

REM تشغيل الخادم
python -m http.server 8000 --bind 0.0.0.0

REM إذا فشل التشغيل، انتظر 5 ثواني وحاول مرة أخرى
if errorlevel 1 (
    echo انتظار 5 ثواني وإعادة المحاولة...
    timeout /t 5 /nobreak >nul
    python -m http.server 8000 --bind 0.0.0.0
)

pause
