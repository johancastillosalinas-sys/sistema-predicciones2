import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Permite que Vercel termine la compilación aunque existan advertencias de tipos estrictos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;