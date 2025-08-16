/**
 * @fileoverview Webpack configuration for AutoFlow Studio Chrome Extension
 * @author Ayush Shukla
 * @description Build configuration for TypeScript + React Chrome extension
 */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "inline-source-map",

    entry: {
      // Background service worker
      background: "./src/background/background.ts",

      // Content script
      content: "./src/content/content-script.ts",

      // Sidebar content script
      sidebar: "./src/content/sidebar.ts",

      // Popup React app
      popup: "./src/popup/index.tsx",
    },

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@shared": path.resolve(__dirname, "../shared"),
        "@chrome": path.resolve(__dirname, "src"),
      },
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: path.resolve(__dirname, "tsconfig.json"),
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: "asset/resource",
        },
      ],
    },

    plugins: [
      // Generate popup HTML
      new HtmlWebpackPlugin({
        template: "./src/popup/popup.html",
        filename: "popup.html",
        chunks: ["popup"],
      }),

      // Copy static assets
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./src/manifest.json",
            to: "manifest.json",
          },
          {
            from: "./src/icons",
            to: "icons",
            noErrorOnMissing: true,
          },
          {
            from: "./src/styles",
            to: "styles",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],

    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            enforce: true,
          },
        },
      },
    },

    // Chrome extension specific settings
    target: "web",

    // Ensure proper handling of chrome APIs
    externals: {
      chrome: "chrome",
    },
  };
};
