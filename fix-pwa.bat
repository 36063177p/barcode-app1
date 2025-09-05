@echo off
echo ========================================
echo    إصلاح مشكلة PWA - إضافة للشاشة الرئيسية
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
echo خطوات إصلاح PWA:
echo.
echo 1. افتح المتصفح على الهاتف واذهب إلى:
echo    http://%ip%:8000/debug-pwa.html
echo.
echo 2. اضغط "تشغيل جميع الاختبارات"
echo 3. تحقق من النتائج واتبع الاقتراحات
echo.
echo 4. إذا كانت جميع الاختبارات نجحت:
echo    - اذهب إلى: http://%ip%:8000
echo    - اضغط "إضافة للشاشة الرئيسية"
echo.
echo 5. إذا لم تنجح الاختبارات:
echo    - اتبع الاقتراحات المعروضة
echo    - استخدم create-icons.html لإنشاء الأيقونات
echo    - تأكد من وجود manifest.json و sw.js
echo.

echo المشاكل الشائعة:
echo - الأيقونات مفقودة: استخدم create-icons.html
echo - HTTPS مطلوب: استخدم GitHub Pages أو Vercel
echo - Service Worker لا يعمل: تحقق من sw.js
echo - Manifest خاطئ: تحقق من manifest.json
echo.

echo اضغط Ctrl+C لإيقاف الخادم
echo.

REM تشغيل الخادم
python -m http.server 8000 --bind 0.0.0.0

pause
