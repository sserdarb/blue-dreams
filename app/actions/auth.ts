'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'blueconcierge';
const COOKIE_NAME = 'admin_session';

export async function login(formData: FormData) {
  const password = formData.get('password');

  if (password === ADMIN_PASSWORD) {
    (await cookies()).set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return { success: true };
  } else {
    return { success: false, error: 'Invalid password' };
  }
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
  redirect('/en/admin/login');
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}
