import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow `quality={90}` on `<Image />` (Hero photo, Avatar) without warnings.
    // Default Next 16 only permits 75 unless explicitly opted-in.
    qualities: [70, 75, 90],
  },
};

export default nextConfig;
