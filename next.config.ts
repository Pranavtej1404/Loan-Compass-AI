import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  devIndicators: { buildActivity: false },
};

export default nextConfig;
