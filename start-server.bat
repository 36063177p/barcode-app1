@echo off
chcp 65001 >nul
title تطبيق إدارة جلسات الباركود - خادم محلي

echo ====================================================
echo 🔍 تطبيق إدارة جلسات الباركود
echo ====================================================
echo.

REM التحقق من وجود Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت على النظام
    echo يرجى تثبيت Python من: https://python.org
    echo.
    pause
    exit /b 1
)

REM التحقق من وجود الملفات المطلوبة
if not exist "index.html" (
    echo ❌ ملف index.html غير موجود
    echo تأكد من تشغيل الملف في مجلد التطبيق الصحيح
    pause
    exit /b 1
)

if not exist "app.js" (
    echo ❌ ملف app.js غير موجود
    echo تأكد من تشغيل الملف في مجلد التطبيق الصحيح
    pause
    exit /b 1
)

echo ✅ جميع الملفات موجودة
echo.

REM إنشاء الأيقونات إذا لم تكن موجودة
if not exist "icon-192.png" (
    echo 📱 إنشاء أيقونات التطبيق...
    python create-simple-icons.py
    echo.
)

echo 🚀 بدء تشغيل الخادم المحلي...
echo 📝 ملاحظة: سيتم فتح التطبيق في المتصفح تلقائياً
echo ⏹️  للإيقاف: اضغط Ctrl+C في هذه النافذة
echo.

REM تشغيل الخادم
python server.py

pause
