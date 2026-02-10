'use client';

import { useFormState } from 'react-dom';
import { login } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const initialState = {
  success: false,
  error: '',
};

export default function LoginPage() {
  const router = useRouter();

  // wrapper to handle redirect on client side after success
  async function handleLogin(prevState: any, formData: FormData) {
    const result = await login(formData);
    if (result.success) {
      return { success: true, error: '' };
    }
    return { success: false, error: result.error || 'Login failed' };
  }

  const [state, formAction] = useFormState(handleLogin, initialState);

  useEffect(() => {
    if (state.success) {
      router.push('/admin'); // Redirect to locale-independent admin panel
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Admin Login</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              placeholder="E-posta adresinizi girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              placeholder="Şifrenizi girin"
            />
          </div>

          {state.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
