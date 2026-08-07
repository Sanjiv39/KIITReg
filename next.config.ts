import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://sca-kdev.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
