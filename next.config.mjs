/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  reactStrictMode: false,

  transpilePackages: ['phaser'],

  allowedDevOrigins: ['*.*.*'],

  env: {
    PROJECT_ID: process.env.HAPPYSEEDS_PROJECT_ID ?? '',
    REACTUS_BASE_URL: process.env.REACTUS_BASE_URL ?? '',
  },
};

export default nextConfig;
