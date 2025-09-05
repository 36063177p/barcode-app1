# اختبار التطبيق على الهاتف المحمول
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   اختبار التطبيق على الهاتف المحمول" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# الحصول على عنوان IP
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" }

Write-Host "عناوين IP المتاحة:" -ForegroundColor Yellow
foreach ($ip in $ipAddresses) {
    Write-Host "  - $($ip.IPAddress)" -ForegroundColor Green
}

$primaryIP = $ipAddresses[0].IPAddress

Write-Host ""
Write-Host "افتح المتصفح على الهاتف واذهب إلى:" -ForegroundColor Yellow
Write-Host "http://$primaryIP:8000" -ForegroundColor Green
Write-Host ""
Write-Host "أو جرب:" -ForegroundColor Yellow
Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host ""

Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Red
Write-Host ""

# تشغيل الخادم
try {
    python -m http.server 8000 --bind 0.0.0.0
}
catch {
    Write-Host "خطأ في تشغيل الخادم: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "تأكد من تثبيت Python" -ForegroundColor Yellow
}

Read-Host "اضغط Enter للخروج"
