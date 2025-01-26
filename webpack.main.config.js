// webpack.main.config.js
module.exports = {
  entry: "./src/main.js",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    fallback: {}, // No fallbacks for native Node modules in the main process
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};