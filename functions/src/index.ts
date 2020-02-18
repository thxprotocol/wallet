import * as functions from 'firebase-functions';
const qrcode = require('qrcode');

export const webhook = functions.https
    .onRequest(async (request, response) => {
    const pool: string = request.body.pool;
    const rule: number = parseInt(request.body.rule, 10);
    const key: string = request.body.key;
    const data = {
         rule,
         pool,
         key,
    };
    const stringified = JSON.stringify(data);
    const qr = await qrcode.toDataURL(stringified);

    return response.send(qr);
});
