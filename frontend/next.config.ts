// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8050/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;