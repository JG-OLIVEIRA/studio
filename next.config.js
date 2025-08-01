
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // We are removing the cache disabling configuration as it may interfere
    // with Next.js's Fast Refresh and cause server restart loops.
    return config;
  },
};

module.exports = nextConfig;
