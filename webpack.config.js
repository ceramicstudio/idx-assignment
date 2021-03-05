const path = require('path')
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/app.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: [
          /^.*content-hash\/.*$/,
        ],
        loader: 'string-replace-loader',
        options: {
          search: 'multicodec/src/base-table.json',
          replace: 'multicodec/src/base-table.js',
        }
      },
    ],
  },
  devServer: {
    writeToDisk: true,
  },
  node: {
    console: false,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
}
