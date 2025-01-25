// webpack.renderer.config.js
const rules = require("./webpack.rules");

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
  ],
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false, // Prevents polyfill for fs module in renderer
    },
  },
};