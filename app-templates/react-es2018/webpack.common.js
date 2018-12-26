/* eslint-disable import/no-extraneous-dependencies,no-console */
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const {ProvidePlugin, DefinePlugin} = webpack;

const {
    CONTEXT_PATH = '',
    APPLICATION_THEME
} = process.env;

const DEFAULT_THEME = 'purple';

const THEMES = [
    'khaki',
    'olive',
    'indy',
    'navy',
    'purple',
    'pink',
    'ruby'
];

const theme = THEMES.includes(APPLICATION_THEME)
    ? APPLICATION_THEME
    : DEFAULT_THEME;

module.exports = {
    entry: './src',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: `/${CONTEXT_PATH}`
    },
    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            // {
            //     test: /\.html$/,
            //     use: 'html-loader'
            // },
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    {
                        loader: 'sass-loader', // compiles Sass to CSS,
                        options: {
                            includePaths: [
                                path.resolve(__dirname, 'src/themes', theme),
                                path.resolve(__dirname, 'src')
                            ]
                        }
                    }
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
                    publicPath: `/${CONTEXT_PATH}`
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebPackPlugin({
            title: 'React Web Application',
            template: './src/index.hbs',
            filename: './index.html',
            favicon: './src/assets/img/favicon.ico'
        }),
        new ProvidePlugin({
            React: 'react',
            classNames: 'classnames',
            PropTypes: 'prop-types'
        }),
        new DefinePlugin({
            'process.env': {
                APPLICATION_REPOSITORY: JSON.stringify(process.env.APPLICATION_REPOSITORY),
                APPLICATION_BRANCH: JSON.stringify(process.env.APPLICATION_BRANCH),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                CONTEXT_PATH: JSON.stringify(process.env.CONTEXT_PATH)
            }
        })
    ],
    devServer: {
        contentBase: './dist'
    }
};
