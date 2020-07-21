var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin")//css插件
var HtmlWebpackPlugin = require('html-webpack-plugin') //html插件
var CleanWebpackPlugin = require('clean-webpack-plugin') //清理目录
var UglifyJsPlugin = require('uglifyjs-webpack-plugin') //js压缩
var CopyWebpackPlugin = require('copy-webpack-plugin') //拷贝目录文件
module.exports = {
    entry: {
        // main: './app/main.js'
        vendor: './app/vendor.js',//第三方js入口
        theme: './app/theme.js',

    },
    output: {
        path: path.resolve(__dirname, './dist'), //输出目录
        filename: 'js/[name]-[hash].min.js' //输出js文件名
    },
    devServer: {
        contentBase: './dist'  //dev线上模式
    },
    devtool: '#eval-source-map',
    module: {
        rules: [{
            test: /\.css|less$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true,
                        minimize: true
                    },
                },
                publicPath: '../',

            })
        },
        {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg|gif|svg)$/,
            use: ['file-loader?name=img/[name]-[hash].[ext]']
        }, {
            test: /\.(woff|eot|ttf|ttf|woff2)$/,
            use: ['file-loader?name=fonts/[name]-[hash].[ext]']
        }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']), //清理dist
        new ExtractTextPlugin({ //提取css
            filename: "css/[name]-[hash].css",
            allChunks: true
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new HtmlWebpackPlugin({ //html模板
            filename: 'index.html',
            template: 'index.html',
            inject: 'body',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            chunksSortMode: 'dependency'
        }),

        new UglifyJsPlugin({ //压缩js
            sourceMap: true,
            uglifyOptions: {
                ie8: true,
                compress: true
            }
        }),
        new CopyWebpackPlugin([{
            from: __dirname + '/src/public'
        }])
    ],
    optimization: {
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "common",
                    chunks: "all"
                }
            }
        }
    }
}