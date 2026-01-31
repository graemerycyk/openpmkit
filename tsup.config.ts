import { defineConfig } from 'tsup';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths to workspace packages
const workspaceAliases = {
  '@pmkit/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
  '@pmkit/prompts': path.resolve(__dirname, 'packages/prompts/src/index.ts'),
  '@openpmkit/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
  '@openpmkit/prompts': path.resolve(__dirname, 'packages/prompts/src/index.ts'),
};

const externalDeps = [
  'commander',
  'chalk',
  'ora',
  'dotenv',
  'node-cron',
  'nanoid',
  'zod',
];

export default defineConfig([
  // CLI entry point
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    outDir: 'dist',
    clean: true,
    sourcemap: true,
    dts: false, // CLI doesn't need type declarations
    // Note: shebang is already in source file src/cli/index.ts
    // Bundle workspace packages inline
    noExternal: [/@pmkit\/.*/, /@openpmkit\/.*/],
    external: externalDeps,
    esbuildOptions(options) {
      options.alias = workspaceAliases;
    },
  },
  // Library entry point (for programmatic usage)
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    outDir: 'dist',
    clean: false, // Don't clean, CLI build already did
    sourcemap: true,
    // DTS generation disabled - workspace packages outside rootDir
    // Users can import from the JS bundle; types are bundled inline
    dts: false,
    // Bundle workspace packages inline
    noExternal: [/@pmkit\/.*/, /@openpmkit\/.*/],
    external: externalDeps,
    esbuildOptions(options) {
      options.alias = workspaceAliases;
    },
  },
]);
