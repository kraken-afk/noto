import rspack from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { baseConfig } from './rspack.config.ts';

export default defineConfig({
  ...baseConfig,
  target: ['es2022', 'web'],
  entry: {
    'index.client': join(cwd(), 'frontend/views/index.client.tsx'),
    'login.client': join(cwd(), 'frontend/views/login.client.tsx'),
    'register.client': join(cwd(), 'frontend/views/register.client.tsx'),
  },
  output: {
    path: join(cwd(), 'frontend/static/client/'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              importMeta: true,
            },
            transform: {
              react: { runtime: 'automatic' },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.css$/i,
        use: [
          // 'style-loader',
          rspack.CssExtractRspackPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {},
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
});
