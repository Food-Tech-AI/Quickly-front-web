import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  
  // Note: Removed rewrites - we use Next.js API routes as a proxy to the backend
  // This prevents conflicts between /app/api routes and backend routes
};

export default nextConfig;
