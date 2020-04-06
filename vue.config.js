const webpack = require('webpack');
const path = require('path');

module.exports = {
    publicPath: '/',
    devServer: {
        https: true,
    },
    outputDir: './dist/',
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.NETWORK': JSON.stringify(process.env.NETWORK),
            }),
        ],
    },
    chainWebpack: (config) => {
        config.module
            .rule('abi')
            .test(/\.abi$/)
            .use('json-loader')
            .loader('json-loader')
            .end();
        config.module
            .rule('bin')
            .test(/\.bin$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end();
    },
};
