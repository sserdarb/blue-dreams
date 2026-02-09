'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'admin_session';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'E-posta ve şifre gereklidir.' };
  }

  const trimmedEmail = email.toLowerCase().trim();

  // Always check hardcoded superadmin first
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sserdarb@gmail.com').toLowerCase().trim();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tuba@2015Tuana';

  if (trimmedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    (await cookies()).set(COOKIE_NAME, JSON.stringify({
      email: trimmedEmail,
      role: 'superadmin',
      name: 'Admin',
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return { success: true };
  }

  // Then check database for other users
  try {
    const db = prisma as any;
    const user = await db.adminUser.findUnique({
      where: { email: trimmedEmail }
    });

    if (user && user.password === password && user.isActive) {
      await db.adminUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const sessionValue = JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      (await cookies()).set(COOKIE_NAME, sessionValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return { success: true };
    }
  } catch (error) {
    console.error('DB lookup error (non-fatal):', error);
  }

  return { success: false, error: 'E-posta veya şifre yanlış.' };
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
  redirect('/tr/admin/login');
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return { email: 'admin', role: 'superadmin' };
  }
}
