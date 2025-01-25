// webpack.main.config.js
module.exports = {
  entry: "./src/main.js",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
    },
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};