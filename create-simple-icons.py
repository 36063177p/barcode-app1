#!/usr/bin/env python3
"""
سكريبت بسيط لإنشاء أيقونات PWA للتطبيق
يتطلب مكتبة Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # إنشاء صورة بخلفية متدرجة
        img = Image.new('RGB', (size, size), color='#667eea')
        draw = ImageDraw.Draw(img)
        
        # رسم دائرة بيضاء في الوسط
        circle_size = size // 3
        center = size // 2
        circle_bbox = [
            center - circle_size,
            center - circle_size,
            center + circle_size,
            center + circle_size
        ]
        draw.ellipse(circle_bbox, fill='white', outline='#764ba2', width=size//50)
        
        # رسم خطوط باركود بسيطة
        bar_width = size // 30
        bar_height = size // 4
        start_x = center - (bar_width * 5)
        start_y = center - bar_height // 2
        
        for i in range(10):
            if i % 2 == 0:  # رسم خطوط متناوبة
                draw.rectangle([
                    start_x + (i * bar_width),
                    start_y,
                    start_x + (i * bar_width) + bar_width - 2,
                    start_y + bar_height
                ], fill='#333333')
        
        # حفظ الصورة
        img.save(filename, 'PNG')
        print(f"تم إنشاء {filename} بحجم {size}x{size}")
    
    # إنشاء الأيقونات
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    
    print("✅ تم إنشاء جميع الأيقونات بنجاح!")
    print("📁 الملفات المُنشأة:")
    print("   - icon-192.png")
    print("   - icon-512.png")

except ImportError:
    print("❌ مكتبة Pillow غير مثبتة")
    print("لتثبيتها، نفذ الأمر: pip install Pillow")
    print("أو استخدم create-icons.html في المتصفح")

except Exception as e:
    print(f"❌ خطأ في إنشاء الأيقونات: {e}")
    print("استخدم create-icons.html في المتصفح كبديل")
