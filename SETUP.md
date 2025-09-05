# 🚀 دليل الإعداد السريع

## خطوات البدء السريع

### 1. إعداد Supabase (5 دقائق)

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساب
2. أنشئ مشروع جديد
3. في SQL Editor، انسخ والصق محتوى ملف `database.sql`
4. نفذ الكود لإنشاء الجداول
5. اذهب إلى Settings > API وانسخ:
   - `Project URL`
   - `anon public` key

### 2. تكوين التطبيق (دقيقة واحدة)

1. افتح `app.js`
2. استبدل السطرين التاليين:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. إنشاء الأيقونات (دقيقتان)

1. افتح `create-icons.html` في المتصفح
2. اضغط "تحميل" لكل أيقونة
3. احفظ الملفات باسم `icon-192.png` و `icon-512.png`

### 4. تشغيل التطبيق

#### الطريقة الأولى: خادم محلي
```bash
# إذا كان لديك Python
python -m http.server 8000

# أو إذا كان لديك Node.js
npx serve .

# ثم اذهب إلى http://localhost:8000
```

#### الطريقة الثانية: Live Server (VS Code)
1. ثبت إضافة "Live Server" في VS Code
2. اضغط بالزر الأيمن على `index.html`
3. اختر "Open with Live Server"

### 5. اختبار الميزات

✅ **بدء جلسة جديدة**: اضغط الزر الأزرق  
✅ **إدخال باركود يدوي**: اكتب أي رقم واضغط Enter  
✅ **الماسح الضوئي**: اضغط زر الكاميرا (يحتاج HTTPS)  
✅ **التقارير**: اضغط زر التقارير  
✅ **التصدير**: جرب تصدير CSV و Excel  

## 🔧 إعدادات متقدمة

### تخصيص التحقق من الباركود
```javascript
// في app.js، عدّل هذه الدالة:
function validateBarcode(barcode) {
    // مثال: باركود يجب أن يكون 13 رقم
    return /^\d{13}$/.test(barcode);
    
    // مثال: باركود يبدأ بـ "PRD"
    // return barcode.startsWith('PRD') && barcode.length === 10;
}
```

### تفعيل HTTPS للكاميرا
الكاميرا تعمل فقط مع HTTPS. للتطوير المحلي:

```bash
# استخدم ngrok
npx ngrok http 8000

# أو استخدم خادم HTTPS محلي
npx local-ssl-proxy --source 8443 --target 8000
```

## 🌐 النشر

### Netlify (مجاني)
1. اذهب إلى [netlify.com](https://netlify.com)
2. اسحب مجلد المشروع إلى الصفحة
3. سيتم نشر التطبيق تلقائياً

### Vercel (مجاني)
1. اذهب إلى [vercel.com](https://vercel.com)
2. ربط مع GitHub أو اسحب المجلد
3. سيتم النشر تلقائياً

### GitHub Pages
1. ارفع الملفات إلى مستودع GitHub
2. فعّل GitHub Pages في الإعدادات
3. سيكون التطبيق متاح على `username.github.io/repo-name`

## ❓ حل المشاكل

| المشكلة | الحل |
|---------|------|
| الكاميرا لا تعمل | تأكد من استخدام HTTPS وإعطاء الأذونات |
| قاعدة البيانات لا تعمل | تحقق من مفاتيح Supabase |
| التصدير لا يعمل | تأكد من تحميل مكتبة XLSX |
| التطبيق لا يظهر بشكل صحيح | تحقق من وحدة التحكم للأخطاء |

## 📱 تثبيت كتطبيق

في Chrome/Edge:
1. اضغط على أيقونة التثبيت في شريط العناوين
2. أو اذهب إلى القائمة > تثبيت التطبيق

في Safari:
1. اضغط زر المشاركة
2. اختر "إضافة إلى الشاشة الرئيسية"

---

🎉 **مبروك! تطبيقك جاهز للاستخدام**
