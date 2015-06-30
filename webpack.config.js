var getPages = require('./npm_tasks/get-pages');
var path = require('path');
var webpack = require('webpack');
var config = require('./www_src/config');

// Prep all entry points
var entry = {};
getPages().forEach(function (page) {
  entry[page] = './www_src/pages/' + page + '/' + page + '.jsx';
});

module.exports = {
  entry: entry,
  devtool: 'source-map', //not good for ff
  output: {
    path: __dirname + '/app/src/main/assets/www/js',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders:  ['babel-loader'],
        include: path.resolve(__dirname, 'www_src')
      },
      {
        test: /\.jsx$/,
        loaders:  ['babel-loader', 'jsx-loader'],
        include: path.resolve(__dirname, 'www_src')
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        include: [path.resolve(__dirname, 'www_src'),  path.resolve(__dirname, 'node_modules')]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      '__WEBPACK_CONFIG': config
    })
  ]
};
