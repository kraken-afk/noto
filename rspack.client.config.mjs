
// @ts-check
import { defineConfig } from '@rspack/cli';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { baseConfig } from './rspack.config.mjs';

export default defineConfig({
  ...baseConfig,
  target: ['es2022', 'web'],
  entry: {
    'index.client': join(cwd(), 'frontend/views/index.client.tsx'),
  },
  output: {
    path: join(cwd(), 'frontend/static/client/'),
    filename: '[name].js',
    clean: true,
  },
});

