import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AWS SDK S3 (R2 signed URL, P3) chỉ chạy server-side trong route/RSC.
  // Đánh dấu external để Turbopack không cố bundle vào client + tránh lỗi
  // "Module not found" với native deps khi `next build` (RT2-14).
  serverExternalPackages: [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
  ],
  images: {
    // Allow `quality={90}` on `<Image />` (Hero photo, Avatar) without warnings.
    // Default Next 16 only permits 75 unless explicitly opted-in.
    qualities: [70, 75, 90],
    // Template/blog cover ảnh host trên Cloudflare R2 public bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-c5d3e1873a534ee89daedcf9e6dc380b.r2.dev",
        pathname: "/template/**",
      },
    ],
  },
};

export default nextConfig;
