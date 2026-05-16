'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createSessionToken,
  verifyAdminPassword,
} from '@/lib/admin/session';

const SAFE_NEXT_PATH = /^\/admin(?:\/.*)?$/;

export type LoginState = {
  ok: boolean;
  message?: string;
};

export async function adminLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!password) {
    return { ok: false, message: 'Vui lòng nhập mật khẩu.' };
  }
  if (!verifyAdminPassword(password)) {
    return { ok: false, message: 'Mật khẩu không đúng.' };
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());

  const target = SAFE_NEXT_PATH.test(next) ? next : '/admin';
  redirect(target);
}

export async function adminLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
