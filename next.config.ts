import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // add enviroment variables here to be used in the app
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;
