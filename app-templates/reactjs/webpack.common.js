const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {ProvidePlugin, DefinePlugin} = webpack;

module.exports = {
  entry: './src',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
		modules: ['node_modules', './src'],
		extensions: ['.js', '.jsx'],
	},
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS
        ]
      },
      {
         test: /\.css$/,
         use: [
           'style-loader',
           'css-loader'
        ]
      },
      {
        test: /\.(eot|woff2?|otf|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[hash].[ext]',
          publicPath: '/'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebPackPlugin({
      title: 'React Web Application',
      template: "./src/index.html",
      filename: "./index.html",
      favicon: './src/assets/img/favicon.ico',
      faviconFilename: './assets/img/favicon.ico'
    }),
    new ProvidePlugin({
      'React': 'react'
    }),
    new DefinePlugin({
      'process.env': {
        'APPLICATION_REPOSITORY': JSON.stringify(process.env.APPLICATION_REPOSITORY),
        'APPLICATION_BRANCH': JSON.stringify(process.env.APPLICATION_BRANCH),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  devServer: {
    contentBase: "./dist"
  }
};
