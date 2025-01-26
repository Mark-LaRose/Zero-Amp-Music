// webpack.rules.js
const webpack = require("webpack");

module.exports = [
  {
    // Loader for audio files
    test: /\.(mp3|wav)$/,
    use: {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]", // Maintain original path and file name
      },
    },
  },
  {
    // Loader for JavaScript and JSX files
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
    path: require.resolve("path-browserify"), // Use path-browserify in the renderer
    fs: false, // Prevent polyfilling for the fs module in the renderer
  },
};