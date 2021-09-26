const path = require('path');
const src = path.resolve(__dirname, 'src');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = [
  /** モダン向け */
  {
    watch: true,
    target: ['web', 'es5'],
    entry: {
      index: src + '/js/index.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js',
    },
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.js', '.ts', '.css'],
    },
    module: {
      rules: [
        // ts、jsの読み込みとコンパイル
        {
          test: /\.(ts|js)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: 'ts-loader',
            },
            {
              loader: 'tslint-loader',
            },
          ],
        },
        // Sassファイルの読み込みとコンパイル
        {
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
        // 画像ファイルの読み込みとコンパイル
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
      ], // rules
    }, // module
  },
];


