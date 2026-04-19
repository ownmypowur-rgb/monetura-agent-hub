import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["reactflow", "@reactflow/core"],
  env: {
    NEXT_PUBLIC_ORCHESTRATOR_URL: "https://orchestrator.moneturamedia.com",
    NEXT_PUBLIC_ORCHESTRATOR_API_KEY: "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599",
  },
};
export default nextConfig;
