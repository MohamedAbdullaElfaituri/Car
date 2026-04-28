import { LockKeyhole, Phone } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <img src="/logo.jpeg" alt="بوسنينه لخدمات السيارات" className="mb-8 h-20 w-auto rounded-lg bg-white object-contain p-2" />
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">بوسنينه لخدمات السيارات</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-300">
              نظام داخلي سريع لإدارة العملاء والسيارات والمعاملات والفواتير والتقارير من الهاتف والكمبيوتر.
            </p>
          </div>

          <form action={loginAction} className="rounded-lg bg-white p-5 text-brand-black shadow-soft sm:p-8">
            <h2 className="text-2xl font-bold">تسجيل الدخول</h2>
            <p className="mt-2 text-sm text-zinc-500">دخول المدير فقط. كلمة المرور تقبل أي قيمة الآن إلى حين ربط Supabase.</p>

            <label className="mt-6 block text-sm font-semibold" htmlFor="identifier">
              البريد أو الهاتف
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3">
              <Phone className="h-5 w-5 text-zinc-400" />
              <input id="identifier" name="identifier" required className="h-12 w-full bg-transparent outline-none" placeholder="manager@bosnina.local" />
            </div>

            <label className="mt-4 block text-sm font-semibold" htmlFor="password">
              كلمة المرور
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3">
              <LockKeyhole className="h-5 w-5 text-zinc-400" />
              <input id="password" name="password" type="password" required className="h-12 w-full bg-transparent outline-none" placeholder="••••••••" />
            </div>

            <input type="hidden" name="role" value="manager" />
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-800">
              دخول المدير فقط. العمال يتم تسجيلهم داخل النظام لحساب المعاملات والعمولات بدون حسابات دخول.
            </div>

            <button className="mt-6 h-12 w-full rounded-lg bg-brand-red font-bold text-white transition hover:bg-red-700">دخول النظام</button>
          </form>
        </div>
      </section>
    </main>
  );
}
