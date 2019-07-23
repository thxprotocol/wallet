<template>
<article class="region region--container">
    <Header ref="header" />
    <main class="region region--content">
        <h3>{{ pool.name }} [{{pool.balance}} THX]</h3>
        <hr class="dotted">
        <div v-if="!orderedPoolTransfers.length">Loading pool transfers...</div>
        <ul class="list list--dotted" v-if="orderedPoolTransfers">
            <li v-bind:key="transfer.hash" v-for="transfer in orderedPoolTransfers">
                <div class="description">
                    <div v-if="transfer.from">
                        <small>From: </small><span class="badge badge--default">{{transfer.from}}</span>
                    </div>
                    <div v-if="transfer.to">
                        <small>To: </small><span class="badge badge--default">{{transfer.to}}</span>
                    </div>
                    <small>{{ transfer.created }}</small>
                </div>
                <div class="actions">
                    <strong>{{transfer.amount}} THX</strong>
                </div>
            </li>
        </ul>
        <h3>Token Transfers</h3>
        <hr class="dotted">
        <div v-if="!orderedTokenTransfers.length">Loading token transfers...</div>
        <ul class="list list--dotted" v-if="orderedTokenTransfers">
            <li v-bind:key="transfer.hash" v-for="transfer in orderedTokenTransfers">
                <div class="description">
                    <div>
                        <small>From: </small><span class="badge badge--default">{{transfer.from}}</span>
                    </div>
                    <div>
                        <small>To: </small><span class="badge badge--default">{{transfer.to}}</span>
                    </div>
                </div>
                <div class="actions">
                    <strong>{{transfer.amount}} THX</strong>
                </div>
            </li>
        </ul>
    </main>
</article>
</template>

<script>
import firebase from 'firebase';
import 'firebase/database';

import Vue from 'vue';
import Header from '../components/Header.vue'

import EventService from '../services/EventService.js';
import StateService from '../services/StateService.js';

const THX = window.THX;

const _ = require('lodash');

export default {
    name: 'home',
    components: {
        Header
    },
    computed: {
        orderedTokenTransfers: function () {
            let arr = [];
            for (let hash in this.tokenTransfers) arr.unshift(this.tokenTransfers[hash]);
            return arr
        },
        orderedPoolTransfers: function () {
            return _.orderBy(this.poolTransfers, 'timestamp').reverse()
        }
    },
    data: function() {
        return {
            poolTransfers: {},
            tokenTransfers: {},
            pool: {
                name: "",
                balance: 0
            },
            ea: new EventService(),
            state: new StateService(),
        }
    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);
    },
    methods: {
        async init(uid, key) {
            const fromBlock = await this.getCurrentBlockId();
            const offset = 10000;
            let token, pool;

            await THX.contracts.load(key);

            token = THX.contracts.instances.token;
            pool = THX.contracts.instances.pool;

            this.pool.name = await pool.methods.name().call();
            this.pool.balance = await token.methods.balanceOf(pool._address).call();

            this.$refs.header.updateBalance();

            this.ea.listen('event.Transfer', this.addMyTransfer);
            this.ea.listen('event.Deposited', this.addDeposit);
            this.ea.listen('event.Withdrawn', this.addWithdrawel);


            token.getPastEvents('Transfer', {
                filter: { from: THX.contracts.currentUserAddress },
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addMyTransfers(events);
            });

            token.getPastEvents('Transfer', {
                filter: { to: THX.contracts.currentUserAddress },
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addMyTransfers(events);
            });

            pool.getPastEvents('Deposited', {
                filter: {},
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addAllDeposits(events);
            });

            pool.getPastEvents('Withdrawn', {
                filter: {},
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addAllWithdrawels(events);
            });
        },
        getCurrentBlockId() {
            return THX.contracts.web3.eth.getBlockNumber().then(data => {
                return data;
            });
        },
        async addAllDeposits(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const value = data[key].returnValues;
                const uid = await firebase.database().ref(`wallets/${value.sender.toLowerCase()}/uid`).once('value');
                const to = await firebase.database().ref(`users/${uid.val()}/email`).once('value');
                const date = new Date(value.created*1000);

                Vue.set(this.poolTransfers, hash, {
                    hash: hash,
                    from: to.val(),
                    amount: "+" + Number(value.amount),
                    timestamp: value.created,
                    created: `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`,
                });
            }
        },
        async addAllWithdrawels(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const value = data[key].returnValues;
                const uid = await firebase.database().ref('wallets').child(value.beneficiary).child('uid').once('value');
                const to = await firebase.database().ref('users').child(uid.val()).child('email').once('value');

                Vue.set(this.poolTransfers, hash, {
                    hash: hash,
                    to: to.val(),
                    amount: "-" + Number(value.amount),
                });
            }
        },
        addMyTransfers(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const value = data[key].returnValues;
                const from = value.from.toLowerCase();
                const to = value.to.toLowerCase();
                const amount = value.value;

                this.createTransfer(hash, from, to, amount);
            }
        },
        addMyTransfer(data) {
            const value = data.detail;
            const hash  = event.transactionHash;
            const from = value.from.toLowerCase();
            const to = value.to.toLowerCase();
            const amount = value.value;

            this.createTransfer(hash, from, to, amount);

            this.$refs.header.updateBalance();
        },
        createTransfer(hash, from, to, amount) {
            Vue.set(this.tokenTransfers, hash, {
                hash: hash,
                from: from,
                to: to,
                amount: Number(amount),
            });
        },
        async addDeposit(data) {
            const deposit = data.detail;
            const hash = deposit.transactionHash;

            const uid = await firebase.database().ref(`wallets/${deposit.sender.toLowerCase()}/uid`).once('value');
            const to = await firebase.database().ref(`users/${uid.val()}/email`).once('value');
            const date = new Date(deposit.created*1000);

            Vue.set(this.poolTransfers, hash, {
                hash: hash,
                from: to.val(),
                amount: "+" + Number(deposit.amount),
                timestamp: deposit.created,
                created: `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`,
            });
        },
        async addWithdrawel(data) {
            const withdrawel = data.detail;
            const hash = withdrawel.transactionHash;

            const uid = await firebase.database().ref(`wallets/${withdrawel.sender.toLowerCase()}/uid`).once('value');
            const to = await firebase.database().ref(`users/${uid.val()}/email`).once('value');
            const date = new Date(withdrawel.created*1000);

            Vue.set(this.poolTransfers, hash, {
                hash: hash,
                from: to.val(),
                amount: "-" + Number(withdrawel.amount),
                timestamp: withdrawel.created,
                created: `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`,
            });
        }
    }
}
</script>
