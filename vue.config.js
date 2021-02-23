module.exports = {
    publicPath: '/',
    devServer: {
        https: true,
    },
    pwa: {
        name: 'THX Web Wallet',
        themeColor: '#FDE542',
        iconPaths: {
            favicon32: 'img/icons/pwa_icon.png',
            favicon16: 'img/icons/pwa_icon.png',
            appleTouchIcon: 'img/icons/pwa_icon.png',
            msTileImage: 'img/icons/pwa_icon.png',
        },
        manifestOptions: {
            short_name: 'THX',
        },
        display: 'standalone',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',

        // configure the workbox plugin
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // swSrc is required in InjectManifest mode.
            swSrc: 'dev/sw.js',
            // ...other Workbox options...
        },
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
