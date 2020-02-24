import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import axios from 'axios';

const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
const POOL_ADDRESS = "0xE7FA4ca3257F852a96de1543fb8B9f802C7be933";
const API_ROOT = 'https://us-central1-thx-wallet-dev.cloudfunctions.net/api';
const APP_ROOT = 'https://thx-wallet-dev.firebaseapp.com';

function QRBuffer(qrBase64: string) {
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const match = qrBase64.match(regex);

    if (match && match[2]) {
        return Buffer.from(match[2], 'base64');
    } else {
        return;
    }
}

admin.initializeApp(functions.config().firebase);

app.use(cors({ origin: true }));

app.get('/qr/connect/:pool/:slack', async (req: any, res: any) => {
    const data = {
        pool: req.params.pool,
        slack: req.params.slack,
    };
    const qrBase64 = await qrcode.toDataURL(JSON.stringify(data));

    res.writeHead(200, {
        'Content-Type': 'image/png',
    });
    res.end(QRBuffer(qrBase64));
})

app.get('/qr/claim/:pool/:rule/:key', async (req: any, res: any) => {
    const data = {
        pool: req.params.pool,
        rule: req.params.rule,
        key: req.params.key,
    };
    const qrBase64 = await qrcode.toDataURL(JSON.stringify(data));

    res.writeHead(200, {
        'Content-Type': 'image/png',
    });
    res.end(QRBuffer(qrBase64));
})

app.post('/connect', (req: any, res: any) => {
    const imageUrl = API_ROOT + `/qr/connect/${POOL_ADDRESS}/${req.body.user_id}`;
    const message = {
        "as_user": true,
        "attachments": [
            {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Connect your THX wallet!*"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Scan the QR code with your authorized THX wallet. \n Verify that you connect with Slack ID: *${req.body.user_id}*`
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": imageUrl,
                            "alt_text": "qr code for connecting your account"
                        }
                    }
                ]
            }
        ]
    };

    res.send(message);
})

app.post('/reward', (req: any, res: any) => {
    const query = req.body.text.split(' ');

    if (query[0].startsWith('<@')) {
        const channel = query[0].split('@')[1].split('|')[0];
        const rule = 0;
        const key = 123;
        const message = {
            "as_user": true,
            "channel": channel,
            "attachments": [
                {
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*Congratulations! You have received a reward!* :moneybag:"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Scan the QR code with your authorized THX wallet and claim this reward. \n\n You don't have a wallet?:scream: No harm done, register a fresh one!"
                            },
                            "accessory": {
                                "type": "image",
                                "image_url": API_ROOT + `/qr/claim/${POOL_ADDRESS}/${rule}/${key}`,
                                "alt_text": "qr code for reward verification"
                            }
                        },
                        {
                            "type": "actions",
                            "elements": [
                                {
                                    "type": "button",
                                    "url": APP_ROOT + "/register",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Register Wallet"
                                    }
                                },
                                {
                                    "type": "button",
                                    "url": APP_ROOT + `/claim/${POOL_ADDRESS}/${rule}`,
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Claim on this device"
                                    },
                                    "style": "primary"
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        res.send(message);

        // axios({
        //         method: 'POST',
        //         url: 'https://slack.com/api/chat.postMessage',
        //         headers: {
        //             'Authorization': 'Bearer xoxb-874849905696-951441147569-jiqzfWErHKgPlDvBNzE40Jwh',
        //             'Content-Type': 'application/json;charset=utf-8',
        //         },
        //         data: {}
        //     })
        //     .then((r: any) => {
        //         res.send('*Your reward has been sent!* 🏆');
        //     })
        //     .catch((e: any) => {
        //         res.send(e);
        //     });

    } else {
        res.send('Make sure to mention a pool member. \n Example: `/reward @chuck`')
    }
});

app.post('/rules', async (req: any, res: any) => {
    const query = req.body.text.split(' ');

    if (query[0] === 'list') {
        const snap = await admin.database().ref(`/pools/${POOL_ADDRESS}/rules`).once('value');

        if (snap.val()) {
            const blocks = snap.val().map((rule: any, id: number) => {
                return {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*#${id} ${rule.title}* \n ${rule.description}`
                    }
                };
            });

            return res.send({
                "text": `Pool *${POOL_ADDRESS}* has ${blocks.length} rules available.`,
                "attachments": [
                    {
                        "blocks": blocks,
                    }
                ]
            });
        } else {
            return res.send({
                "text": `Pool *${POOL_ADDRESS}* has no rules available.`
            });
        }
    }
    else {
        res.send('Send a query with your command. \n Example: `/rules list`')
    }

});

exports.api = functions.https.onRequest(app);
