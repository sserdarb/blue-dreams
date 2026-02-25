'use client'
export const dynamic = 'force-dynamic';

import { useFormState } from 'react-dom';
import { login } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import PmaGravityLogo from '@/components/admin/PmaGravityLogo';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  Database,
  LineChart,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Eye,
  EyeOff,
  UserPlus,
  Globe
} from 'lucide-react';

const initialState = {
  success: false,
  error: '',
};

const SYSTEM_FEATURES = [
  {
    icon: BarChart3,
    title: 'Canlı Raporlama',
    desc: 'Elektra PMS entegrasyonu ile anlık doluluk, gelir ve kanal analizi',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: BedDouble,
    title: 'Oda Yönetimi',
    desc: '341 oda kapasiteli envanter, dinamik fiyatlandırma ve müsaitlik takvimi',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Yield Management',
    desc: 'Akıllı fiyat optimizasyonu, sezon bazlı strateji ve rakip analizi',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: CalendarCheck,
    title: 'Rezervasyon Merkezi',
    desc: 'Online-offline tüm kanallardan gelen rezervasyonları tek noktada yönetin',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: LineChart,
    title: 'Big Data Analytics',
    desc: 'RevPAR, GOPPAR, ADR ve segment bazlı derinlemesine performans analizi',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Database,
    title: 'ERP Entegrasyonu',
    desc: 'Muhasebe, satın alma, finans ve insan kaynakları modülleri',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Math CAPTCHA
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const generateCaptcha = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaAnswer('');
    setCaptchaError('');
  }, []);

  useEffect(() => { generateCaptcha(); }, [generateCaptcha]);

  // Google Sign-In callback
  const handleGoogleCredential = useCallback(async (response: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/${locale}/admin`);
        router.refresh();
      } else {
        setRegMessage({ type: 'error', text: data.error || 'Google girişi başarısız' });
      }
    } catch {
      setRegMessage({ type: 'error', text: 'Google giriş hatası' });
    }
  }, [router, locale]);

  // Initialize Google Sign-In
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !(window as any).google) return;
    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      if (googleBtnRef.current) {
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          shape: 'pill',
          text: 'signin_with',
          locale: locale,
        });
      }
    } catch (e) { console.error('Google Sign-In init error', e); }
  }, [handleGoogleCredential, locale, mode]);

  async function handleLogin(prevState: any, formData: FormData) {
    // Validate CAPTCHA first
    const answer = parseInt(captchaAnswer);
    if (answer !== captchaA + captchaB) {
      generateCaptcha();
      return { success: false, error: 'Güvenlik doğrulaması yanlış. Lütfen tekrar deneyin.' };
    }
    const result = await login(formData);
    if (result.success) {
      return { success: true, error: '' };
    }
    generateCaptcha();
    return { success: false, error: result.error || 'Giriş başarısız' };
  }

  const [state, formAction] = useFormState(handleLogin, initialState);

  useEffect(() => {
    if (state.success) {
      router.push(`/${locale}/admin`);
      router.refresh();
    }
  }, [state.success, router, locale]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage(null);
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegMessage({ type: 'success', text: data.message || 'Kayıt talebiniz alındı!' });
        setRegName(''); setRegEmail(''); setRegPassword('');
      } else {
        setRegMessage({ type: 'error', text: data.error || 'Kayıt başarısız' });
      }
    } catch {
      setRegMessage({ type: 'error', text: 'Bağlantı hatası' });
    }
    setRegLoading(false);
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || !(window as any).google) return;
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredential,
          });
          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_black', size: 'large', width: '100%', shape: 'pill', text: 'signin_with', locale,
            });
          }
        } catch (e) { console.error('GSI init error', e); }
      }} />
      <div className="min-h-screen bg-[#030712] flex relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Radial glows */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Language Selector (Top Right) */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
          <div className="flex items-center gap-2 pl-2">
            <Globe size={16} className="text-cyan-400" />
            <span className="text-slate-400 text-[10px] font-bold tracking-widest hidden sm:inline-block">DİL SEÇİMİ</span>
          </div>
          <div className="flex bg-white/[0.05] rounded-lg p-1 gap-1">
            {['tr', 'en', 'de', 'ru'].map((lang) => (
              <a
                key={lang}
                href={`/${lang}/admin/login`}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${locale === lang
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                {lang.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Left Panel — System Description */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10">
          {/* Logo */}
          <div>
            <PmaGravityLogo size={52} textSize="lg" />
            <p className="text-slate-400 mt-4 text-lg max-w-md leading-relaxed">
              Otel yönetiminin geleceği. Tüm operasyonlarınızı tek bir
              platformdan yönetin, analiz edin ve optimize edin.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 my-8">
            {SYSTEM_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-slate-500 text-xs">Canlı PMS Bağlantısı</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-slate-500 text-xs">256-bit SSL Şifreleme</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-purple-400" />
              <span className="text-slate-500 text-xs">Çoklu Kullanıcı Desteği</span>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo — only shows on small screens */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <PmaGravityLogo size={56} textSize="lg" className="justify-center" />
              <p className="text-slate-500 text-sm mt-3 text-center max-w-xs">
                Otel yönetiminin geleceği — tek bir platformdan yönetin
              </p>
            </div>

            {/* Login/Register Card */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 lg:p-10 shadow-2xl shadow-black/20">
              {/* Mode Tabs */}
              <div className="flex bg-white/[0.03] rounded-xl p-1 mb-8 border border-white/5">
                <button
                  onClick={() => { setMode('login'); setRegMessage(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Lock size={15} /> Giriş Yap
                </button>
                <button
                  onClick={() => { setMode('register'); setRegMessage(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <UserPlus size={15} /> Kayıt Talebi
                </button>
              </div>

              {mode === 'login' ? (
                <>
                  {/* Card Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={18} className="text-cyan-400" />
                      <h2 className="text-xl font-bold text-white">Sisteme Giriş</h2>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Yönetim paneline erişmek için kimlik bilgilerinizi girin
                    </p>
                  </div>

                  <form action={formAction} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                        placeholder="admin@bluedreams.com"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Şifre
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          autoComplete="current-password"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Math CAPTCHA */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Güvenlik Doğrulaması
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-cyan-400 font-bold text-lg select-none flex-shrink-0">
                          <ShieldCheck size={16} className="text-cyan-500" />
                          {captchaA} + {captchaB} = ?
                        </div>
                        <input
                          type="number"
                          required
                          value={captchaAnswer}
                          onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError(''); }}
                          className="w-24 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm text-center font-bold"
                          placeholder="?"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {state.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {state.error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white py-3.5 px-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 group"
                    >
                      Giriş Yap
                      <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Divider */}
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-[#0a0f1a] px-3 text-slate-500">veya</span></div>
                    </div>

                    {/* Google Sign-In */}
                    <div ref={googleBtnRef} className="flex justify-center [&>div]:!w-full" />
                  </form>
                </>
              ) : (
                <>
                  {/* Register Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus size={18} className="text-purple-400" />
                      <h2 className="text-xl font-bold text-white">Kayıt Talebi</h2>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Bilgilerinizi girin, yönetici onayından sonra giriş yapabilirsiniz
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-posta Adresi</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Şifre</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                        placeholder="Min. 6 karakter"
                      />
                    </div>

                    {regMessage && (
                      <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${regMessage.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${regMessage.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {regMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white py-3.5 px-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {regLoading ? 'Gönderiliyor...' : 'Kayıt Talebi Gönder'}
                      <ChevronRight size={16} />
                    </button>
                  </form>
                </>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-[10px] uppercase tracking-widest">Pma Gravity v1.0</span>
                  <span className="text-slate-600 text-[10px] uppercase tracking-widest">Blue Dreams Resort</span>
                </div>
              </div>
            </div>

            {/* Mobile features — only on small screens */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
              {SYSTEM_FEATURES.slice(0, 4).map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                    <Icon size={16} className="text-cyan-400 mb-1.5" />
                    <p className="text-white text-xs font-medium">{feature.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
