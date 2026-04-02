import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["better-sqlite3"],
    images: {
       unoptimized: true,
       remotePatterns: [
         {
           protocol: "https",
           hostname: "**",
         },
         {
           protocol: "http",
           hostname: "**",
         },
       ],
     },
};

export default nextConfig;
