'use client'
export const dynamic = 'force-dynamic';

import { useFormState } from 'react-dom';
import { login } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const initialState = {
  success: false,
  error: '',
};

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';

  async function handleLogin(prevState: any, formData: FormData) {
    const result = await login(formData);
    if (result.success) {
      return { success: true, error: '' };
    }
    return { success: false, error: result.error || 'Giriş başarısız' };
  }

  const [state, formAction] = useFormState(handleLogin, initialState);

  useEffect(() => {
    if (state.success) {
      router.push(`/${locale}/admin`);
      router.refresh();
    }
  }, [state.success, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-white mb-2">Blue Dreams</h1>
          <p className="text-white/50 text-sm tracking-widest uppercase">Yönetim Paneli</p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">E-posta</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              placeholder="E-posta adresinizi girin"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Şifre</label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              placeholder="Şifrenizi girin"
            />
          </div>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-bold tracking-wider uppercase text-sm transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
