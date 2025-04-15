
// @ts-check
import rspack from '@rspack/core';

/** @type {import("@rspack/cli").Configuration} */
export const baseConfig = {
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
        test: /\.css$/,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                },
              },
            },
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin({
      filename: 'main.css',
    }),
  ],
  experiments: {
    css: true,
  },
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },
};
