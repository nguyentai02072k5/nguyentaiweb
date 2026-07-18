/**
 * require-course-user.ts — Trust boundary cho MỌI route /api/course/* (RT-6).
 *
 * Vì sao cần helper riêng (không chỉ gọi getCurrentUser() rải rác):
 *   - `/api/course/*` KHÔNG thừa hưởng gate `learn/[khoa]/layout.tsx` (route sibling).
 *   - proxy `course.*` BỎ QUA `/api` hoàn toàn (không gate edge) → mint API tự bảo vệ.
 *   Vậy mint handler CHÍNH là trust boundary. 1 helper dùng chung = 1 chỗ enforce,
 *   grep ra dễ, không route nào quên.
 *
 * `getCurrentUser()` đã `auth.getUser()` (revalidate JWT — RT-1), nên đây là
 * authz THẬT chứ không phải đọc session cookie tin bừa.
 */

import 'server-only';
import { getCurrentUser } from '@/lib/supabase/get-user';
import type { User } from '@supabase/supabase-js';

/**
 * Trả user đã xác thực, hoặc null nếu chưa đăng nhập.
 * Caller (route handler) BẮT BUỘC trả 401 khi null.
 */
export async function requireCourseUser(): Promise<User | null> {
  return getCurrentUser();
}
