import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
