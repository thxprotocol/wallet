module.exports = {
    publicPath: '/',
    devServer: {
        https: true,
    },
    outputDir: './dist/',
    chainWebpack: config => {
        config.module
            .rule('abi')
            .test(/\.abi$/)
            .use('json-loader')
            .loader('json-loader')
            .end();
    },
};
