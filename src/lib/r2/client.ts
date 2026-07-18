/**
 * r2/client.ts — Cloudflare R2 signed-URL cho video khoá học (P3, RT-7).
 *
 * SECURITY: `import 'server-only'` — throw build-time nếu bị import vào Client
 * Component. R2 secret KHÔNG bao giờ được vào bundle browser. Player client
 * nhận URL đã ký (initialVideoUrl prop hoặc qua /api/course/video-url), KHÔNG
 * bao giờ thấy key/secret.
 *
 * TTL 4h (14400s) thay vì 5' (RT-7): 5' hết hạn GIỮA bài dài → khi seek vùng
 * chưa buffer, R2 trả 403. Với lead-magnet FREE (đăng nhập = xem hết, không
 * heartbeat), TTL ngắn KHÔNG tăng bảo mật đáng kể mà phá UX. R2 presigned GET
 * hỗ trợ tới 7 ngày; 4h phủ trọn 1 bài + dư seek.
 *
 * Lazy client (mirror server-client.ts): env chỉ validate lúc REQUEST đầu tiên,
 * KHÔNG lúc module eval — `next build` import mọi route module để collect data;
 * validate ở top-level sẽ làm build đỏ khi var vắng dù route là force-dynamic.
 */

import 'server-only';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** TTL signed URL — 4h phủ 1 bài dài + seek (RT-7). */
export const VIDEO_URL_TTL_SECONDS = 4 * 60 * 60; // 14400

let cachedClient: S3Client | null = null;

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId) throw new Error('Missing env: R2_ACCOUNT_ID');
  if (!accessKeyId) throw new Error('Missing env: R2_ACCESS_KEY_ID');
  if (!secretAccessKey) throw new Error('Missing env: R2_SECRET_ACCESS_KEY');

  cachedClient = new S3Client({
    region: 'auto', // R2 dùng region cố định 'auto'
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

/**
 * Mint presigned GET URL cho 1 object video trong bucket R2 private.
 * @param videoKey object key trong bucket (vd `courses/chatbot/bai-1.mp4`).
 */
export async function getSignedVideoUrl(videoKey: string): Promise<string> {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('Missing env: R2_BUCKET');

  const command = new GetObjectCommand({ Bucket: bucket, Key: videoKey });
  return getSignedUrl(getR2Client(), command, {
    expiresIn: VIDEO_URL_TTL_SECONDS,
  });
}
