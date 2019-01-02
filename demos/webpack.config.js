var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: '#inline-source-map',
  entry: {
    MultiplePickers: __dirname + '/MultiplePickers/index.js',
    RealWorld: __dirname + '/RealWorld/index.js',
    RealWorldWithAsync: __dirname + '/RealWorldWithAsync/index.js',
    RealWorldWithSaga: __dirname + '/RealWorldWithSaga/index.js',
  },
  output: {
    path: __dirname,
    filename: '[name]/build.js',
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    alias: {
      'refect': path.join(__dirname, '..', 'src/'),
    },
    extensions: ['.js'],
  },

  stats: {
    colors: true,
    chunks: false,
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      include: [
        __dirname,
        path.join(__dirname, '..', 'src'),
      ],
    }, {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: [
        __dirname,
        path.join(__dirname, '..', 'node_modules'),
      ],
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: [
        __dirname,
        path.join(__dirname, '..', 'node_modules'),
      ],
    }],
  },
};
