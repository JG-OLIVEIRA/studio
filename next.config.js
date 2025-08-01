
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Disable webpack cache in development to prevent issues with corrupted cache files.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
