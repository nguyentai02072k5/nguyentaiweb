import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * og-fonts.ts - Load font local cho ImageResponse (OG động).
 * Be Vietnam Pro (OFL) hỗ trợ dấu tiếng Việt - dùng cho cả title (600) lẫn body (400).
 * Phải là file local: ImageResponse/Satori cần ArrayBuffer, không fetch Google runtime.
 */

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 600;
  style: 'normal';
};

export async function loadOgFonts(): Promise<OgFont[]> {
  const dir = join(process.cwd(), 'public', 'fonts');
  const [regular, semibold] = await Promise.all([
    readFile(join(dir, 'BeVietnamPro-Regular.ttf')),
    readFile(join(dir, 'BeVietnamPro-SemiBold.ttf')),
  ]);
  return [
    { name: 'Be Vietnam Pro', data: regular, weight: 400, style: 'normal' },
    { name: 'Be Vietnam Pro', data: semibold, weight: 600, style: 'normal' },
  ];
}
