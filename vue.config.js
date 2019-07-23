const webpack = require('webpack');

// vue.config.js
module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.NETWORK': JSON.stringify(process.env.NETWORK)
            })
        ]
    }
}
