const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pmkit/core',
    '@pmkit/mcp',
    '@pmkit/mcp-servers',
    '@pmkit/mock-tenant',
    '@pmkit/prompts',
    '@pmkit/content',
  ],
  images: {
    domains: ['getpmkit.com'],
  },
  webpack: (config, { isServer }) => {
    // Resolve workspace packages from monorepo root
    config.resolve.alias = {
      ...config.resolve.alias,
      '@pmkit/content': path.resolve(__dirname, '../../packages/content/dist'),
      '@pmkit/core': path.resolve(__dirname, '../../packages/core/dist'),
      '@pmkit/mcp': path.resolve(__dirname, '../../packages/mcp/dist'),
      '@pmkit/mcp-servers': path.resolve(__dirname, '../../packages/mcp-servers/dist'),
      '@pmkit/mock-tenant': path.resolve(__dirname, '../../packages/mock-tenant/dist'),
      '@pmkit/prompts': path.resolve(__dirname, '../../packages/prompts/dist'),
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
};

module.exports = nextConfig;

