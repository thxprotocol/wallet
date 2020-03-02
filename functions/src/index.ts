import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { LocalAddress, CryptoUtils, LoomProvider, Client } from 'loom-js';

const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const Web3 = require('web3');

const slack = express();
const api = express();

const POOL_ADDRESS = "0xE7FA4ca3257F852a96de1543fb8B9f802C7be933";
const API_ROOT = 'https://us-central1-thx-wallet-dev.cloudfunctions.net/api';
const APP_ROOT = 'https://thx-wallet-dev.firebaseapp.com';
const REWARD_POOL_JSON = require('./contracts/RewardPool.json');
const EXTDEV_CHAIN_ID = 'extdev-plasma-us1';
const PRIVATE_KEY_ARRAY = CryptoUtils.generatePrivateKey();

function QRBuffer(qrBase64: string) {
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const match = qrBase64.match(regex);

    if (match && match[2]) {
        return Buffer.from(match[2], 'base64');
    } else {
        return;
    }
}

async function ExtdevContract(abi: any, address: string) {
    const client: any = new Client(
        EXTDEV_CHAIN_ID,
        'wss://extdev-plasma-us1.dappchains.com/websocket',
        'wss://extdev-plasma-us1.dappchains.com/queryws',
    );
    const provider = new LoomProvider(client, PRIVATE_KEY_ARRAY);
    const web3 = new Web3(provider);

    return new web3.eth.Contract(abi, address);
}

async function RewardRule(id: number) {
    const snap = await admin.database().ref(`/pools/${POOL_ADDRESS}/rules/${id}`).once('value');
    const r = snap.val();
    return (r)
        ? {
            id: id,
            title: r.title,
            description: r.description,
            amount: 0,
        }
        : null;
}

admin.initializeApp(functions.config().firebase);

api.use(cors({ origin: true }));

api.post('/rewards', async (req: any, res: any) => {
    const data = {
        pool: req.body.pool,
        rule: req.body.rule,
    };
    const qrBase64 = await qrcode.toDataURL(JSON.stringify(data));

    res.send(qrBase64);
});

api.get('/rules/:id', async (req: any, res: any) => {
    const rule = await RewardRule(req.params.id);
    res.writeHead((rule) ? 200 : 404, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(rule));
});

api.get('/rules', async (req: any, res: any) => {
    const poolContract = await ExtdevContract(
        REWARD_POOL_JSON.abi,
        POOL_ADDRESS,
    );
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(PRIVATE_KEY_ARRAY);
    const address = LocalAddress.fromPublicKey(publicKey).toString();
    const length = parseInt(await poolContract.methods.countRules().call({ from: address }), 10);

    if (length > 0) {
        const rules: any[] = [];

        for (let id = 0; id < length; id++) {
            const rule = await RewardRule(id);
            const r = await poolContract.methods.rules(id).call({ from: address });

            if (rule) {
                rule.amount = r.amount;
                rules.push(rule);
            }
        }

        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(rules));
    } else {
        res.writeHead(404, {
            'Content-Type': 'application/json',
        });
        res.end({
            "message": `Pool ${POOL_ADDRESS} has no rules available.`
        });
    }
});

api.get('/qr/connect/:pool/:slack', async (req: any, res: any) => {
    const data = {
        pool: req.params.pool,
        slack: req.params.slack,
    };
    const qrBase64 = await qrcode.toDataURL(JSON.stringify(data));

    res.writeHead(200, {
        'Content-Type': 'image/png',
    });
    res.end(QRBuffer(qrBase64));
});

api.get('/qr/claim/:pool/:rule', async (req: any, res: any) => {
    const data = {
        pool: req.params.pool,
        rule: req.params.rule,
    };
    const qrBase64 = await qrcode.toDataURL(JSON.stringify(data));

    res.writeHead(200, {
        'Content-Type': 'image/png',
    });
    res.end(QRBuffer(qrBase64));
});

exports.api = functions.https.onRequest(api);




slack.use(cors({ origin: true }));
slack.post('/connect', (req: any, res: any) => {
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

slack.post('/reward', (req: any, res: any) => {
    const query = req.body.text.split(' ');

    if (query[0].startsWith('<@')) {
        const channel = query[0].split('@')[1].split('|')[0];
        const rule = 0;
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
                                "image_url": API_ROOT + `/qr/claim/${POOL_ADDRESS}/${rule}`,
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

        axios({
                method: 'POST',
                url: 'https://slack.com/api/chat.postMessage',
                headers: {
                    'Authorization': 'Bearer xoxb-874849905696-951441147569-jiqzfWErHKgPlDvBNzE40Jwh',
                    'Content-Type': 'application/json;charset=utf-8',
                },
                data: message,
            })
            .then((r: any) => {
                res.send('*Your reward has been sent!* 🏆');
            })
            .catch((e: any) => {
                res.send(e);
            });

    } else {
        res.send('Make sure to mention a pool member. \n Example: `/reward @chuck`')
    }
});

slack.post('/rules', async (req: any, res: any) => {
    const query = req.body.text.split(' ');

    if (query[0] === 'list') {
        const poolContract = await ExtdevContract(
            REWARD_POOL_JSON.abi,
            POOL_ADDRESS,
        );
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(PRIVATE_KEY_ARRAY);
        const address = LocalAddress.fromPublicKey(publicKey).toString();
        const length = parseInt(await poolContract.methods.countRules().call({ from: address }), 10);
        const utils = new Web3().utils;

        if (length > 0) {
            const blocks: any[] = [];

            for (let id = 0; id < length; id++) {
                const rule = await RewardRule(id);
                const r = await poolContract.methods.rules(id).call({ from: address });

                if (rule) {
                    rule.amount = r.amount;

                    blocks.push({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "#" + rule.id + " " + rule.title + " *" + utils.fromWei(rule.amount, 'ether') + " THX*"
                        }
                    });
                }
            }

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

exports.slack = functions.https.onRequest(slack);
