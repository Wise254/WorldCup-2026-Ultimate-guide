import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Image optimization — allow local images and any external sources you use
  images: {
    // No remote patterns needed since all images are local in /public
    // But if you ever add external images, add them here:
    // remotePatterns: [
    //   { protocol: "https", hostname: "**.example.com" },
    // ],
    
    // Optimize image formats
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;