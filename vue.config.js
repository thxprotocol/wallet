const webpack = require('webpack');

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/wallet/' : '/',
    devServer: {
        https: true
    },
    outputDir: "./dist/wallet/",
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.NETWORK': JSON.stringify(process.env.NETWORK)
            })
        ]
    }
}
