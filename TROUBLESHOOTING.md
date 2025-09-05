# 🔧 دليل استكشاف الأخطاء وإصلاحها

## 🚨 المشاكل الشائعة وحلولها

### 1. مشاكل CORS و Service Worker

#### المشكلة:
```
SW registration failed: TypeError: Failed to register a ServiceWorker: 
The URL protocol of the current origin ('null') is not supported.
```

#### السبب:
فتح ملف `index.html` مباشرة في المتصفح (بروتوكول `file://`)

#### الحلول:

**الحل الأول: استخدام الخادم المحلي (مُوصى به)**
```bash
# تشغيل الخادم باستخدام Python
python server.py

# أو استخدام ملف batch في الويندوز
start-server.bat

# أو PowerShell
./Start-BarcodeApp.ps1
```

**الحل الثاني: خادم Python البسيط**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**الحل الثالث: Node.js**
```bash
# تثبيت serve عالمياً
npm install -g serve

# تشغيل الخادم
serve -s . -p 8000
```

**الحل الرابع: Live Server (VS Code)**
1. ثبت إضافة "Live Server" في VS Code
2. اضغط بالزر الأيمن على `index.html`
3. اختر "Open with Live Server"

---

### 2. مشكلة الأيقونات المفقودة

#### المشكلة:
```
icon-192.png:1 Failed to load resource: net::ERR_FILE_NOT_FOUND
```

#### الحلول:

**الحل الأول: إنشاء الأيقونات تلقائياً**
```bash
python create-simple-icons.py
```

**الحل الثاني: استخدام أداة الويب**
1. افتح `create-icons.html` في المتصفح
2. اضغط "تحميل" لكل أيقونة
3. احفظ الملفات باسم `icon-192.png` و `icon-512.png`

**الحل الثالث: تحميل أيقونات جاهزة**
- ضع أي صورة PNG بحجم 192x192 واسمها `icon-192.png`
- ضع أي صورة PNG بحجم 512x512 واسمها `icon-512.png`

---

### 3. مشاكل Supabase

#### المشكلة:
```
Failed to load resource: the server responded with a status of 400 ()
خطأ في إضافة الباركود: Object
```

#### الأسباب المحتملة:

1. **إعدادات Supabase خاطئة**
```javascript
// تحقق من هذه القيم في app.js
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // يجب أن تكون رابط صحيح
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // يجب أن يكون مفتاح صحيح
```

2. **قاعدة البيانات غير مُعدة**
```sql
-- نفذ هذا في Supabase SQL Editor
-- انسخ والصق محتوى database.sql كاملاً
```

3. **أذونات قاعدة البيانات**
```sql
-- تأكد من تفعيل RLS وإضافة السياسات
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;
```

#### الحلول:

**الحل الأول: التحقق من الإعدادات**
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى Settings > API
4. انسخ Project URL و anon public key
5. استبدلهما في `app.js`

**الحل الثاني: إعادة إنشاء قاعدة البيانات**
1. افتح SQL Editor في Supabase
2. انسخ والصق محتوى `database.sql`
3. نفذ الكود

**الحل الثالث: التشغيل بدون قاعدة بيانات**
- التطبيق سيعمل في وضع محلي بدون حفظ البيانات

---

### 4. مشاكل الكاميرا

#### المشكلة:
الكاميرا لا تعمل أو لا تظهر

#### الأسباب:
1. عدم منح أذونات الكاميرا
2. استخدام HTTP بدلاً من HTTPS
3. الكاميرا مستخدمة من تطبيق آخر

#### الحلول:

**للتطوير المحلي:**
```bash
# استخدام ngrok لـ HTTPS
npx ngrok http 8000

# أو استخدام mkcert
mkcert localhost
```

**للإنتاج:**
- استخدم HTTPS دائماً
- تأكد من أذونات الكاميرا في المتصفح

---

### 5. مشاكل التصدير

#### المشكلة:
التصدير لا يعمل أو ملفات فارغة

#### الحلول:

**للـ Excel:**
```javascript
// تأكد من تحميل مكتبة XLSX
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

**للـ CSV:**
- تأكد من وجود بيانات في الجلسة
- تحقق من وحدة التحكم للأخطاء

---

## 🔍 أدوات التشخيص

### 1. فحص وحدة التحكم
اضغط `F12` في المتصفح وتحقق من:
- **Console**: رسائل الأخطاء
- **Network**: طلبات قاعدة البيانات
- **Application**: Service Worker و Local Storage

### 2. اختبار الاتصال
```javascript
// نفذ هذا في وحدة التحكم لاختبار Supabase
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_ANON_KEY ? 'موجود' : 'مفقود');
```

### 3. اختبار قاعدة البيانات
```sql
-- نفذ في Supabase SQL Editor
SELECT * FROM sessions LIMIT 5;
SELECT * FROM barcodes LIMIT 5;
```

---

## 📞 الحصول على المساعدة

### معلومات مفيدة عند طلب المساعدة:

1. **نظام التشغيل**: Windows/Mac/Linux
2. **المتصفح**: Chrome/Firefox/Safari + الإصدار
3. **رسالة الخطأ الكاملة**: من وحدة التحكم
4. **خطوات إعادة المشكلة**: ما فعلته قبل حدوث الخطأ
5. **إعدادات Supabase**: هل تم إنشاء قاعدة البيانات؟

### ملفات السجل:
- وحدة التحكم في المتصفح (F12)
- سجل خادم Python (إذا كان يعمل)
- سجل Supabase (في Dashboard)

---

## ✅ قائمة فحص سريعة

قبل الإبلاغ عن مشكلة، تأكد من:

- [ ] تشغيل التطبيق عبر خادم محلي (ليس file://)
- [ ] وجود ملفات `icon-192.png` و `icon-512.png`
- [ ] إعداد Supabase بشكل صحيح
- [ ] تنفيذ سكريبت `database.sql` في Supabase
- [ ] استخدام HTTPS للكاميرا
- [ ] منح أذونات الكاميرا في المتصفح
- [ ] تحديث المتصفح لآخر إصدار

---

🎯 **معظم المشاكل تُحل باستخدام خادم محلي بدلاً من فتح الملف مباشرة!**
