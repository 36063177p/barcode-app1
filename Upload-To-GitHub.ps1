# رفع تطبيق الباركود على GitHub Pages
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   رفع تطبيق الباركود على GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "خطوات رفع المشروع على GitHub:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. اذهب إلى github.com وأنشئ حساب جديد" -ForegroundColor White
Write-Host "2. اضغط 'New repository'" -ForegroundColor White
Write-Host "3. أدخل البيانات:" -ForegroundColor White
Write-Host "   - Repository name: barcode-app" -ForegroundColor Green
Write-Host "   - Description: تطبيق إدارة جلسات الباركود" -ForegroundColor Green
Write-Host "   - Public: ✅ (مهم لـ GitHub Pages)" -ForegroundColor Green
Write-Host "4. اضغط 'Create repository'" -ForegroundColor White
Write-Host ""

Write-Host "5. في صفحة المستودع الجديد:" -ForegroundColor White
Write-Host "   - اضغط 'uploading an existing file'" -ForegroundColor White
Write-Host "   - اسحب جميع ملفات المشروع إلى منطقة الرفع" -ForegroundColor White
Write-Host "   - أضف رسالة: 'رفع تطبيق الباركود الأولي'" -ForegroundColor White
Write-Host "   - اضغط 'Commit changes'" -ForegroundColor White
Write-Host ""

Write-Host "6. تفعيل GitHub Pages:" -ForegroundColor White
Write-Host "   - اذهب إلى Settings" -ForegroundColor White
Write-Host "   - ابحث عن 'Pages'" -ForegroundColor White
Write-Host "   - اختر 'Deploy from a branch'" -ForegroundColor White
Write-Host "   - اختر 'main' branch" -ForegroundColor White
Write-Host "   - اختر '/ (root)' folder" -ForegroundColor White
Write-Host "   - اضغط 'Save'" -ForegroundColor White
Write-Host ""

Write-Host "7. انتظر بضع دقائق واحصل على الرابط:" -ForegroundColor White
Write-Host "   https://USERNAME.github.io/barcode-app" -ForegroundColor Green
Write-Host ""

Write-Host "ملفات المشروع الحالية:" -ForegroundColor Yellow
Get-ChildItem -Name "*.html", "*.js", "*.json", "*.md", "*.bat", "*.ps1" | ForEach-Object {
    Write-Host "   $_" -ForegroundColor Cyan
}

Write-Host ""
$choice = Read-Host "هل تريد فتح دليل GitHub Pages؟ (y/n)"

if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "جاري فتح دليل GitHub Pages..." -ForegroundColor Green
    Start-Process "GITHUB-PAGES-GUIDE.md"
    Write-Host "تم فتح دليل GitHub Pages!" -ForegroundColor Green
}

Write-Host ""
Write-Host "نصائح مهمة:" -ForegroundColor Yellow
Write-Host "- تأكد من أن المستودع Public" -ForegroundColor White
Write-Host "- انتظر 5-10 دقائق للنشر" -ForegroundColor White
Write-Host "- احفظ الرابط للاستخدام الدائم" -ForegroundColor White
Write-Host "- يمكنك تحديث التطبيق برفع ملفات جديدة" -ForegroundColor White

Write-Host ""
Read-Host "اضغط Enter للخروج"
