import type { NextConfig } from "next";

/**
 * Next.js 15 Configuration
 * - remotePatterns: Cloudinary aur Clerk ke images allow karne ke liye zaroori hai
 * - typedRoutes: Type-safe routing support
 * - typescript ka types folder bana lena usme sab rakhna types ko
 */
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
