const path = require('path');
const src = path.resolve(__dirname, 'src');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    index: src + '/js/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      ie: 8,
                      esmodules: true,
                    },
                    useBuiltIns: 'usage',
                    corejs: 3,
                    modules: 'auto',
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.css/,
        use: [
          {
            options: {
              publicPath: '[name].css',
            },
          },
          // CSSを読み込む
          'css-loader',
        ],
      },
      // Sassファイルの読み込みとコンパイル
      {
        // 拡張子がsassとscssのファイルを対象とする
        test: /\.s[ac]ss$/i,
        use: [
          // linkタグに出力する機能
          'style-loader',
          // CSSをバンドルするための機能
          {
            loader: 'css-loader',
          },
          // Sassをバンドルするための機能
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        // 対象となるファイルの拡張子
        test: /\.(gif|png|jpg|eot|wof|woff|ttf|svg|webp)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: (url, resourcePath) => {
                // 処理するファイルの絶対パスに「img」にマッチする文字列があるか判定
                if (/img/.test(resourcePath)) {
                  return `img/${url}`;
                } else {
                  return `webfonts/${url}`;
                }
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new ExtractTextPlugin('css/styles.css'),
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname) + '/index.html',
    //   filename: '../index.html',
    // }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.css'],
  },
  externals: [],
  // ES5(IE11等)向けの指定（webpack 5以上で必要）
  target: ['web', 'es5'],
};
