@echo off
echo ========================================
echo    رفع تطبيق الباركود على GitHub Pages
echo ========================================
echo.

echo خطوات رفع المشروع على GitHub:
echo.
echo 1. اذهب إلى github.com وأنشئ حساب جديد
echo 2. اضغط "New repository"
echo 3. أدخل البيانات:
echo    - Repository name: barcode-app
echo    - Description: تطبيق إدارة جلسات الباركود
echo    - Public: ✅ (مهم لـ GitHub Pages)
echo 4. اضغط "Create repository"
echo.
echo 5. في صفحة المستودع الجديد:
echo    - اضغط "uploading an existing file"
echo    - اسحب جميع ملفات المشروع إلى منطقة الرفع
echo    - أضف رسالة: "رفع تطبيق الباركود الأولي"
echo    - اضغط "Commit changes"
echo.
echo 6. تفعيل GitHub Pages:
echo    - اذهب إلى Settings
echo    - ابحث عن "Pages"
echo    - اختر "Deploy from a branch"
echo    - اختر "main" branch
echo    - اختر "/ (root)" folder
echo    - اضغط "Save"
echo.
echo 7. انتظر بضع دقائق واحصل على الرابط:
echo    https://USERNAME.github.io/barcode-app
echo.

echo ملفات المشروع الحالية:
dir /b *.html *.js *.json *.md *.bat *.ps1 2>nul

echo.
echo اضغط Enter لفتح دليل GitHub Pages...
pause >nul

start GITHUB-PAGES-GUIDE.md

echo.
echo تم فتح دليل GitHub Pages!
echo اتبع التعليمات لرفع المشروع.
echo.

pause
