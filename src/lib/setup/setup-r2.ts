/**
 * setup-r2.ts — ký URL video cho LDP Setup (bucket R2 `tutorial`).
 *
 * Tách riêng khỏi lib/r2/client.ts của Course (đang gác lại) để hai bên không phụ
 * thuộc nhau. Dùng chung 4 env R2_* (token S3 cùng account); bucket cố định ở
 * setup-video-keys.ts. SERVER-ONLY: secret không vào bundle browser.
 */

import 'server-only';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SETUP_VIDEO_BUCKET, SETUP_VIDEO_KEYS } from './setup-video-keys';

/** TTL 2h: đủ xem 1 video + tua, ngắn hơn course để link bị chia sẻ nhanh hết hạn. */
export const SETUP_VIDEO_TTL_SECONDS = 2 * 60 * 60;

let cachedClient: S3Client | null = null;

// Lazy: chỉ validate env ở request đầu, không ở module eval (tránh `next build` đỏ).
function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing env: R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');
  }
  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

/** Ký URL cho 1 video theo id công khai; trả null nếu id không nằm trong danh sách. */
export async function signSetupVideo(id: string): Promise<string | null> {
  const key = SETUP_VIDEO_KEYS[id];
  if (!key) return null;
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: SETUP_VIDEO_BUCKET, Key: key }),
    { expiresIn: SETUP_VIDEO_TTL_SECONDS },
  );
}
