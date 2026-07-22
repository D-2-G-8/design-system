import type { NextConfig } from "next";

// Deployed on Vercel -- no `output: "standalone"` needed (that's for
// self-hosted/container deploys). This app is UI/API only: the actual
// component-generation loop runs as a GitHub Actions workflow
// (.github/workflows/generate.yml), never inside this app or a browser.
const nextConfig: NextConfig = {};

export default nextConfig;
