# تطبيق إدارة جلسات الباركود - خادم محلي
# PowerShell Script للتشغيل السريع

# تعيين الترميز لدعم العربية
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🔍 تطبيق إدارة جلسات الباركود" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود Python
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python متوفر: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "❌ Python غير مثبت على النظام" -ForegroundColor Red
    Write-Host "يرجى تثبيت Python من: https://python.org" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

# التحقق من وجود الملفات المطلوبة
$requiredFiles = @("index.html", "app.js", "manifest.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ ملفات مفقودة:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host "تأكد من تشغيل الملف في مجلد التطبيق الصحيح" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host "✅ جميع الملفات المطلوبة موجودة" -ForegroundColor Green
Write-Host ""

# إنشاء الأيقونات إذا لم تكن موجودة
if (-not (Test-Path "icon-192.png") -or -not (Test-Path "icon-512.png")) {
    Write-Host "📱 إنشاء أيقونات التطبيق..." -ForegroundColor Yellow
    
    if (Test-Path "create-simple-icons.py") {
        try {
            python create-simple-icons.py
            Write-Host "✅ تم إنشاء الأيقونات بنجاح" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  فشل في إنشاء الأيقونات، لكن التطبيق سيعمل" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# عرض معلومات التشغيل
Write-Host "🚀 بدء تشغيل الخادم المحلي..." -ForegroundColor Green
Write-Host "📝 ملاحظات:" -ForegroundColor Cyan
Write-Host "   • سيتم فتح التطبيق في المتصفح تلقائياً" -ForegroundColor White
Write-Host "   • للإيقاف: اضغط Ctrl+C في هذه النافذة" -ForegroundColor White
Write-Host "   • التطبيق سيعمل على http://localhost:8000" -ForegroundColor White
Write-Host ""

# تشغيل الخادم
try {
    python server.py
} catch {
    Write-Host "❌ خطأ في تشغيل الخادم" -ForegroundColor Red
    Write-Host "تفاصيل الخطأ: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "👋 شكراً لاستخدام تطبيق إدارة جلسات الباركود!" -ForegroundColor Yellow
Read-Host "اضغط Enter للخروج"
