'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'admin_session';

async function comparePassword(input: string, stored: string): Promise<boolean> {
  try {
    // If stored password looks like a bcrypt hash, use bcrypt.compare
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$')) {
      return await bcrypt.compare(input, stored);
    }
    // Otherwise, plain text comparison (legacy)
    return input === stored;
  } catch (error) {
    console.error('[Auth] Password compare error:', error);
    return false;
  }
}

export async function login(formData: FormData) {
  // Support both 'email' and 'username' field names for backward compat
  const email = (formData.get('email') || formData.get('username')) as string;
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
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return { success: true };
  }

  // Then check database for other users
  try {
    console.log('[Auth] Looking up DB user:', trimmedEmail);
    const user = await prisma.adminUser.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      console.log('[Auth] User not found in DB:', trimmedEmail);
      return { success: false, error: 'E-posta veya şifre yanlış.' };
    }

    if (!user.isActive) {
      console.log('[Auth] User inactive:', trimmedEmail);
      return { success: false, error: 'Hesabınız devre dışı bırakılmış.' };
    }

    console.log('[Auth] User found, comparing password. Hash starts with:', user.password.substring(0, 7));
    const passwordMatch = await comparePassword(password, user.password);
    console.log('[Auth] Password match result:', passwordMatch);

    if (passwordMatch) {
      // Update lastLogin
      try {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });
      } catch (updateErr) {
        console.error('[Auth] lastLogin update failed (non-fatal):', updateErr);
      }

      const sessionValue = JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      (await cookies()).set(COOKIE_NAME, sessionValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      console.log('[Auth] Login successful for:', trimmedEmail);
      return { success: true };
    } else {
      console.log('[Auth] Password mismatch for:', trimmedEmail);
      return { success: false, error: 'E-posta veya şifre yanlış.' };
    }
  } catch (error) {
    console.error('[Auth] DB lookup error:', error);
    return { success: false, error: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
  }
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

export async function changePassword(currentPassword: string, newPassword: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session) return { success: false, error: 'Oturum bulunamadı.' };

  try {
    const data = JSON.parse(session.value);
    if (!data.userId) {
      return { success: false, error: 'Şifre değişikliği sadece DB kullanıcıları için geçerlidir.' };
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: data.userId }
    });

    if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' };

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) return { success: false, error: 'Mevcut şifre yanlış.' };

    if (newPassword.length < 6) {
      return { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth] Change password error:', error);
    return { success: false, error: 'Şifre değiştirilirken hata oluştu.' };
  }
}
