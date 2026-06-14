import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@react-pdf/renderer", "@browserbasehq/sdk", "@browserbasehq/stagehand"],
};

export default nextConfig;
