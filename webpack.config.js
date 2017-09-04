'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './client/index.html',
  filename: 'index.html',
  inject: 'body'
})

module.exports = {
  entry: './client/index.js',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx?$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css?$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [HtmlWebpackPluginConfig]
}
