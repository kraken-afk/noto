import { defineConfig } from '@rspack/cli';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { baseConfig } from './rspack.config.ts';

export default defineConfig({
  ...baseConfig,
  target: ['es2022'],
  entry: {
    index: join(cwd(), 'frontend/views/index.tsx'),
    login: join(cwd(), 'frontend/views/login.tsx'),
    register: join(cwd(), 'frontend/views/register.tsx'),
  },
  output: {
    path: join(cwd(), 'frontend/views/dist/'),
    filename: '[name].js',
    module: true,
    clean: true,
    library: {
      type: 'module',
    },
  },
  externalsPresets: { node: true },
  externals: ['react', 'react-dom'],
});
