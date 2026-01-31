const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@pmkit/content'],
  images: {
    domains: ['getpmkit.com'],
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@pmkit/content': path.resolve(__dirname, '../../packages/content/src/index.ts'),
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/resources/mcp-connectors-for-enterprise-tools',
        destination: '/resources/secure-connectors-for-enterprise-tools',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
