// webpack.rules.js
const webpack = require("webpack");

module.exports = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react"], // Enable React preset
      },
    },
  },
];

module.exports.resolve = {
  fallback: {
    "path": require.resolve("path-browserify"),
    "fs": false, // Skip polyfill for fs
  },
};
