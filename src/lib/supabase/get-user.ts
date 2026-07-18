/**
 * get-user.ts — Helper lấy user hiện tại từ Supabase Auth (server-side).
 *
 * `import 'server-only'` — guard build-time, không dựa grep thủ công.
 *
 * BẮT BUỘC (RT-1): dùng `auth.getUser()` (HTTP revalidate JWT với Supabase).
 * TUYỆT ĐỐI CẤM `auth.getSession()` trong đường authz — session cookie có thể
 * bị giả mạo phía client, getUser() gọi `/auth/v1/user` để verify thật.
 *
 * `getSession()` CHỈ dùng ở proxy.ts để refresh cookie (exchange refresh-token
 * rẻ hơn, không cần verify cryptographic — xem plan invariant RT2-10).
 */

import 'server-only';
import { cookies } from 'next/headers';
import { createSsrClient } from './ssr-client';
import type { User } from '@supabase/supabase-js';

/**
 * Trả về user đã xác thực hoặc null nếu chưa đăng nhập / token hết hạn.
 *
 * Dùng ở:
 *   - RSC `page.tsx` trong /course (truyền vào CourseHeader)
 *   - Gate layout /course/learn/* (Phase 3)
 *   - Account page /course/tai-khoan (Phase 4)
 *
 * KHÔNG gọi hàm này ở proxy — proxy dùng getSession() để refresh, không authz.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Anon fast-path: không có cookie auth Supabase (`sb-*-auth-token`) → chắc chắn
    // chưa đăng nhập, bỏ qua HTTP getUser() để khách công khai không tốn round-trip.
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));
    if (!hasAuthCookie) return null;

    const supabase = await createSsrClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    // Lỗi mạng hoặc env thiếu → treat as unauthenticated, không crash trang.
    return null;
  }
}
