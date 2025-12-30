const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  experimental: {
    // Enable external packages resolution for monorepos
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Resolve workspace packages to their source files for transpilation
    config.resolve.alias = {
      ...config.resolve.alias,
      '@pmkit/content': path.resolve(__dirname, '../../packages/content/src/index.ts'),
      '@pmkit/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@pmkit/mcp': path.resolve(__dirname, '../../packages/mcp/src/index.ts'),
      '@pmkit/mcp-servers': path.resolve(__dirname, '../../packages/mcp-servers/src/index.ts'),
      '@pmkit/mock-tenant': path.resolve(__dirname, '../../packages/mock-tenant/src/index.ts'),
      '@pmkit/prompts': path.resolve(__dirname, '../../packages/prompts/src/index.ts'),
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

