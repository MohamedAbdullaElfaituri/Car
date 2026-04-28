insert into public.roles(name, description, permissions) values
  ('manager', 'المدير الوحيد للنظام مع تحكم كامل', '{"all": true}')
on conflict (name) do nothing;

insert into public.settings(
  id,
  shop_name,
  phone,
  address,
  currency,
  tax_rate,
  invoice_footer,
  working_hours,
  logo_url,
  primary_color,
  calculate_worker_commissions,
  reports_export_enabled
) values (
  true,
  'بوسنينه لخدمات السيارات',
  '091-555-4422',
  'طرابلس، ليبيا',
  'د.ل',
  0,
  'شكراً لاختياركم بوسنينه لخدمات السيارات',
  'السبت - الخميس، 09:00 ص - 10:00 م',
  '/logo.jpeg',
  '#d71920',
  true,
  true
)
on conflict (id) do update set shop_name = excluded.shop_name;

insert into public.workers(name, phone, commission_rate, active) values
  ('أحمد سالم', '0922222222', 12, true),
  ('علي منصور', '0933333333', 15, true),
  ('سالم فرج', '0944444444', 10, false);

insert into public.services(name, price, duration_minutes, active, description) values
  ('غسيل خارجي', 25, 20, true, 'غسيل جسم السيارة وتجفيف'),
  ('غسيل داخلي', 30, 25, true, 'تنظيف داخلي سريع'),
  ('غسيل خارجي وداخلي', 50, 40, true, 'الباقة اليومية الأكثر طلباً'),
  ('غسيل محرك', 45, 35, true, null),
  ('تلميع داخلي', 120, 90, true, null),
  ('تلميع خارجي', 150, 120, true, null),
  ('تنظيف فرش', 80, 70, true, null),
  ('تنظيف بخار', 95, 75, true, null),
  ('تشميع', 60, 45, true, null),
  ('خدمة خاصة', 100, 60, false, null);
