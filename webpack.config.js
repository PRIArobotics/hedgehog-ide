var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
    entry: ['./build/src/client/app/main.js'],

    devtool: 'source-map',

    output: {
        path: __dirname + 'build/dist',
        filename: '[name].[hash].js',
    },

    resolve: {
        extensions: ['.js']
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },
            /*{
                test: /\.css$/,
                exclude: './build/src/client/app',
                loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
            },*/
            {
                test: /\.css$/,
                use: 'raw-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app']
        }),

        new HtmlWebpackPlugin({
            template: './src/client/index.html'
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin('[name].[hash].css'),
        new webpack.LoaderOptionsPlugin({
            htmlLoader: {
                minimize: false // workaround for ng2
            }
        }),
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery':'jquery',
            'window.jQuery':'jquery'
        }),
        new webpack.DefinePlugin({
            VERSION: "'" + require('./package.json').version + "'",
        })
    ]


};