# إعداد تشغيل التطبيق بشكل دائم
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   إعداد تشغيل التطبيق بشكل دائم" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من صلاحيات المدير
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "تحتاج صلاحيات المدير لتشغيل هذا السكريبت" -ForegroundColor Red
    Write-Host "اضغط بزر الماوس الأيمن على PowerShell واختر 'تشغيل كمدير'" -ForegroundColor Yellow
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host "اختر طريقة التشغيل الدائم:" -ForegroundColor Yellow
Write-Host "1. PWA - تثبيت كتطبيق على الهاتف (الأسهل)" -ForegroundColor Green
Write-Host "2. تشغيل تلقائي عند بدء النظام" -ForegroundColor Blue
Write-Host "3. خدمة Windows (للمستخدمين المتقدمين)" -ForegroundColor Magenta
Write-Host "4. نشر على Vercel (مجاني ودائم)" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "اختر رقم (1-4)"

switch ($choice) {
    "1" {
        Write-Host "إعداد PWA..." -ForegroundColor Green
        Write-Host ""
        
        # الحصول على عنوان IP
        $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" }
        $primaryIP = $ipAddresses[0].IPAddress
        
        Write-Host "عنوان IP الخاص بك: $primaryIP" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "خطوات التثبيت:" -ForegroundColor Yellow
        Write-Host "1. افتح المتصفح على الهاتف واذهب إلى:" -ForegroundColor White
        Write-Host "   http://$primaryIP:8000" -ForegroundColor Green
        Write-Host ""
        Write-Host "2. في Chrome (Android):" -ForegroundColor White
        Write-Host "   - اضغط على القائمة ⋮ في الأعلى" -ForegroundColor White
        Write-Host "   - اختر 'إضافة إلى الشاشة الرئيسية'" -ForegroundColor White
        Write-Host "   - اضغط 'إضافة'" -ForegroundColor White
        Write-Host ""
        Write-Host "3. في Safari (iPhone):" -ForegroundColor White
        Write-Host "   - اضغط على زر المشاركة 📤" -ForegroundColor White
        Write-Host "   - اختر 'إضافة إلى الشاشة الرئيسية'" -ForegroundColor White
        Write-Host "   - اضغط 'إضافة'" -ForegroundColor White
        Write-Host ""
        Write-Host "4. ستظهر أيقونة التطبيق على الشاشة الرئيسية!" -ForegroundColor Green
        
        # تشغيل الخادم
        Write-Host ""
        Write-Host "جاري تشغيل الخادم..." -ForegroundColor Yellow
        python -m http.server 8000 --bind 0.0.0.0
    }
    
    "2" {
        Write-Host "إعداد التشغيل التلقائي..." -ForegroundColor Blue
        Write-Host ""
        
        # إنشاء ملف التشغيل التلقائي
        $startupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
        $scriptPath = "$PSScriptRoot\startup-service.bat"
        
        # نسخ ملف التشغيل التلقائي
        Copy-Item -Path $scriptPath -Destination "$startupPath\startup-service.bat" -Force
        
        Write-Host "تم إعداد التشغيل التلقائي!" -ForegroundColor Green
        Write-Host "سيتم تشغيل التطبيق تلقائياً عند بدء النظام" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "لإيقاف التشغيل التلقائي:" -ForegroundColor Yellow
        Write-Host "1. اضغط Win + R واكتب: shell:startup" -ForegroundColor White
        Write-Host "2. احذف ملف startup-service.bat" -ForegroundColor White
    }
    
    "3" {
        Write-Host "إعداد خدمة Windows..." -ForegroundColor Magenta
        Write-Host ""
        
        # إنشاء خدمة Windows
        $serviceName = "BarcodeAppService"
        $serviceDisplayName = "Barcode App Server"
        $serviceDescription = "خادم تطبيق إدارة جلسات الباركود"
        $scriptPath = "$PSScriptRoot\startup-service.bat"
        
        try {
            # إنشاء الخدمة
            New-Service -Name $serviceName -DisplayName $serviceDisplayName -Description $serviceDescription -BinaryPathName $scriptPath -StartupType Automatic
            
            Write-Host "تم إنشاء الخدمة بنجاح!" -ForegroundColor Green
            Write-Host "اسم الخدمة: $serviceName" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "لإدارة الخدمة:" -ForegroundColor Yellow
            Write-Host "- بدء الخدمة: Start-Service -Name $serviceName" -ForegroundColor White
            Write-Host "- إيقاف الخدمة: Stop-Service -Name $serviceName" -ForegroundColor White
            Write-Host "- حذف الخدمة: Remove-Service -Name $serviceName" -ForegroundColor White
            
        } catch {
            Write-Host "خطأ في إنشاء الخدمة: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host "نشر على Vercel..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "خطوات النشر:" -ForegroundColor Yellow
        Write-Host "1. اذهب إلى vercel.com" -ForegroundColor White
        Write-Host "2. سجل حساب مجاني" -ForegroundColor White
        Write-Host "3. اضغط 'New Project'" -ForegroundColor White
        Write-Host "4. اختر 'Static Site'" -ForegroundColor White
        Write-Host "5. اسحب مجلد المشروع إلى منطقة الرفع" -ForegroundColor White
        Write-Host "6. انتظر النشر واحصل على الرابط الدائم" -ForegroundColor White
        Write-Host ""
        Write-Host "سيتم فتح دليل النشر..." -ForegroundColor Green
        
        # فتح دليل النشر
        Start-Process "deploy-to-vercel.md"
    }
    
    default {
        Write-Host "اختيار غير صحيح!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "تم الانتهاء!" -ForegroundColor Green
Read-Host "اضغط Enter للخروج"
