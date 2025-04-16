import rspack from '@rspack/core';
import type { Configuration } from '@rspack/core';

export const baseConfig: Configuration = {
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
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
        use: ['null-loader'],
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin({
      filename: '[name].css',
    }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },
};
