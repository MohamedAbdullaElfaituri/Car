# بوسنينه لخدمات السيارات

نظام ويب داخلي Responsive لإدارة مغسلة وخدمات سيارات. الواجهة عربية بالكامل RTL، وتعمل كتطبيق PWA قابل للإضافة على شاشة الهاتف.

## التشغيل المحلي

```bash
npm.cmd install
npm.cmd run dev
```

افتح `http://localhost:3000`.

بيانات الدخول التجريبية:

- الدخول من حساب المدير فقط: `manager@bosnina.local`

كلمة المرور في وضع التجربة تقبل أي قيمة. العمال لا يملكون حسابات دخول؛ المدير يضيفهم داخل النظام لحساب المعاملات والعمولات.

## قاعدة البيانات

ملفات PostgreSQL/Supabase موجودة في:

- `supabase/schema.sql`: الجداول، الفهارس، RLS، Triggers، Audit Logs، وإنشاء الفاتورة تلقائياً.
- `supabase/seed.sql`: الخدمات الافتراضية والإعدادات الأولية.

الجداول المطلوبة كلها موجودة: `users`, `roles`, `customers`, `vehicles`, `services`, `wash_orders`, `wash_order_services`, `invoices`, `payments`, `settings`, `audit_logs`. وأضيف جدول `workers` لأن العمال الآن بيانات تشغيلية وعمولات، وليسوا حسابات دخول.

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local` واضبط:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## المميزات المنفذة

- تسجيل دخول تجريبي للمدير فقط.
- تحكم كامل من المدير بكل أقسام النظام.
- Dashboard بإحصائيات ورسوم بسيطة وآخر المعاملات.
- إدارة العملاء والسيارات والخدمات والعمال والعمولات.
- إنشاء معاملة غسيل مع حساب تلقائي للسعر والخصم.
- فواتير قابلة للطباعة والمشاركة عبر واتساب.
- تقارير وفلاتر وتصدير بصري مهيأ.
- إعدادات النظام والفاتورة والألوان والصلاحيات.
- PWA manifest و service worker.
- Soft delete مدعوم في تصميم قاعدة البيانات.
- Audit logs لكل إضافة أو تعديل أو حذف عبر Triggers.
