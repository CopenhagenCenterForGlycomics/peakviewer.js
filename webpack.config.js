module.exports = {
  entry: {
    'peakviewer': [ './js/peakviewer_web.js' ],
  },
  devtool: 'source-map',
  mode: 'development',
  optimization: {
    usedExports: true
  },
  output: {
    filename: '[name]-bundle.js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              modules: false,
              corejs: 'core-js@2',
              useBuiltIns: 'entry',
              targets: {
                browsers: [
                  'Chrome >= 60',
                  'Safari >= 10.1',
                  'iOS >= 10.3',
                  'Firefox >= 54',
                  'Edge >= 15',
                ],
              },
            }],
          ],
        },
      },
    }],
  },
};