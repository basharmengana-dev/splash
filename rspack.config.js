const path = require("path");

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  entry: {
    main: "./client/client.ts",
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
    clean: false, // Don't clean public folder (contains other assets)
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                },
                target: "es2020",
              },
            },
          },
        ],
        type: "javascript/auto",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "builtin:lightningcss-loader",
            options: {
              targets: "defaults",
            },
          },
        ],
        type: "css",
      },
    ],
  },
  devtool: "source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  optimization: {
    minimize: process.env.NODE_ENV === "production",
  },
  stats: {
    preset: "normal",
    colors: true,
  },
};

