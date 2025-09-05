# إصلاح مشكلة PWA - عدم ظهور "إضافة للشاشة الرئيسية"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   إصلاح مشكلة PWA - إضافة للشاشة الرئيسية" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "جاري تشغيل الخادم المحلي..." -ForegroundColor Yellow
Write-Host ""

# الحصول على عنوان IP
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" }
$primaryIP = $ipAddresses[0].IPAddress

Write-Host "عنوان IP الخاص بك: $primaryIP" -ForegroundColor Yellow
Write-Host ""
Write-Host "خطوات إصلاح PWA:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. افتح المتصفح على الهاتف واذهب إلى:" -ForegroundColor White
Write-Host "   http://$primaryIP:8000/debug-pwa.html" -ForegroundColor Green
Write-Host ""
Write-Host "2. اضغط 'تشغيل جميع الاختبارات'" -ForegroundColor White
Write-Host "3. تحقق من النتائج واتبع الاقتراحات" -ForegroundColor White
Write-Host ""
Write-Host "4. إذا كانت جميع الاختبارات نجحت:" -ForegroundColor White
Write-Host "   - اذهب إلى: http://$primaryIP:8000" -ForegroundColor Green
Write-Host "   - اضغط 'إضافة للشاشة الرئيسية'" -ForegroundColor White
Write-Host ""
Write-Host "5. إذا لم تنجح الاختبارات:" -ForegroundColor White
Write-Host "   - اتبع الاقتراحات المعروضة" -ForegroundColor White
Write-Host "   - استخدم create-icons.html لإنشاء الأيقونات" -ForegroundColor White
Write-Host "   - تأكد من وجود manifest.json و sw.js" -ForegroundColor White
Write-Host ""

Write-Host "المشاكل الشائعة:" -ForegroundColor Yellow
Write-Host "- الأيقونات مفقودة: استخدم create-icons.html" -ForegroundColor White
Write-Host "- HTTPS مطلوب: استخدم GitHub Pages أو Vercel" -ForegroundColor White
Write-Host "- Service Worker لا يعمل: تحقق من sw.js" -ForegroundColor White
Write-Host "- Manifest خاطئ: تحقق من manifest.json" -ForegroundColor White
Write-Host ""

Write-Host "الملفات المطلوبة لـ PWA:" -ForegroundColor Yellow
$requiredFiles = @("manifest.json", "sw.js", "icon-192.png", "icon-512.png")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - موجود" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - مفقود" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "اختر إجراء:" -ForegroundColor Yellow
Write-Host "1. تشغيل الخادم وفتح صفحة التشخيص" -ForegroundColor Green
Write-Host "2. إنشاء الأيقونات المفقودة" -ForegroundColor Blue
Write-Host "3. فتح دليل الإصلاح" -ForegroundColor Magenta
Write-Host "4. فتح التطبيق الرئيسي" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "اختر رقم (1-4)"

switch ($choice) {
    "1" {
        Write-Host "جاري تشغيل الخادم..." -ForegroundColor Green
        Write-Host "افتح: http://$primaryIP:8000/debug-pwa.html" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Red
        python -m http.server 8000 --bind 0.0.0.0
    }
    
    "2" {
        Write-Host "إنشاء الأيقونات..." -ForegroundColor Blue
        if (Test-Path "create-icons.html") {
            Start-Process "create-icons.html"
            Write-Host "تم فتح صفحة إنشاء الأيقونات" -ForegroundColor Green
        } else {
            Write-Host "ملف create-icons.html غير موجود" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "فتح دليل الإصلاح..." -ForegroundColor Magenta
        if (Test-Path "PWA-FIX-GUIDE.md") {
            Start-Process "PWA-FIX-GUIDE.md"
            Write-Host "تم فتح دليل الإصلاح" -ForegroundColor Green
        } else {
            Write-Host "ملف PWA-FIX-GUIDE.md غير موجود" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host "فتح التطبيق الرئيسي..." -ForegroundColor Cyan
        Write-Host "افتح: http://$primaryIP:8000" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Red
        python -m http.server 8000 --bind 0.0.0.0
    }
    
    default {
        Write-Host "اختيار غير صحيح!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "نصائح إضافية:" -ForegroundColor Yellow
Write-Host "- استخدم HTTPS للحصول على أفضل تجربة PWA" -ForegroundColor White
Write-Host "- تأكد من تحديث المتصفح" -ForegroundColor White
Write-Host "- امسح cache المتصفح إذا لزم الأمر" -ForegroundColor White
Write-Host "- اختبر على أجهزة مختلفة" -ForegroundColor White

Write-Host ""
Read-Host "اضغط Enter للخروج"
