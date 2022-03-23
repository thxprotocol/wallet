/* eslint @typescript-eslint/no-var-requires: "off" */
const fs = require('fs');

module.exports = {
    publicPath: '/',
    devServer: {
        https: true,
        port: 8083,
        key: process.env.LOCAL_CERT_KEY ? fs.readFileSync(process.env.LOCAL_CERT_KEY) : undefined,
        cert: process.env.LOCAL_CERT ? fs.readFileSync(process.env.LOCAL_CERT) : undefined,
    },
    outputDir: './dist/',
};
