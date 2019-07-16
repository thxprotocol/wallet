<template>
<article class="region region--container">
    <Header />
    <main class="region region--content">
        <h3>{{ pool.name }} [{{pool.balance}} THX]</h3>
        <hr class="dotted">
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
        <ul class="list list--dotted" v-if="tokenTransfers">
            <li v-bind:key="transfer.hash" v-for="transfer in tokenTransfers">
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
import Header from '../components/Header.vue'
import EventService from '../services/EventService.js';
import Vue from 'vue';

const THX = window.THX;

const _ = require('lodash');

export default {
    name: 'home',
    components: {
        Header
    },
    computed: {
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
        }
    },
    created() {
        // eslint-disable-next-line
        THX.ns.connect().then(() => this.init()).catch(() => console.error);
    },
    methods: {
        async init() {
            const pool = THX.ns.instances.pool;
            const token = THX.ns.instances.token;

            this.pool.name = await pool.methods.name().call();
            this.pool.balance = await token.methods.balanceOf(pool.address).call();

            this.ea.listen('event.Transfer', this.addMyTransfer);
            this.ea.listen('event.Deposited', this.addDeposit);
            this.ea.listen('event.Withdrawn', this.addWithdrawel);


            token.getPastEvents('Transfer', {
                filter: { from: THX.ns.account.address },
                fromBlock: 0,
                toBlock: 'latest'
            }, (error, events) => {
                this.addMyTransfers(events);
            });

            pool.getPastEvents('Deposited', {
                filter: {},
                fromBlock: 0,
                toBlock: 'latest'
            }, (error, events) => {
                this.addAllDeposits(events);
            });

            pool.getPastEvents('Withdrawn', {
                filter: {},
                fromBlock: 0,
                toBlock: 'latest'
            }, (error, events) => {
                this.addAllWithdrawels(events);
            });
        },
        async addAllDeposits(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const event = data[key].returnValues;
                const uid = await firebase.database().ref('wallets').child(event.sender).child('uid').once('value');
                const to = await firebase.database().ref('users').child(uid.val()).child('email').once('value');
                const date = new Date(event.created*1000);

                Vue.set(this.poolTransfers, hash, {
                    hash: hash,
                    from: to.val(),
                    amount: "+" + Number(event.amount),
                    timestamp: event.created,
                    created: `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`,
                });
            }
        },
        async addAllWithdrawels(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const event = data[key].returnValues;
                const uid = await firebase.database().ref('wallets').child(event.beneficiary).child('uid').once('value');
                const to = await firebase.database().ref('users').child(uid.val()).child('email').once('value');

                Vue.set(this.poolTransfers, hash, {
                    hash: hash,
                    to: to.val(),
                    amount: "-" + Number(event.amount),
                });
            }
        },
        addMyTransfers(data) {
            for (let key in data) {
                const hash = data[key].transactionHash;
                const event = data[key].returnValues;

                Vue.set(this.tokenTransfers, hash, {
                    hash: hash,
                    from: event.from,
                    to: event.to,
                    amount: Number(event.value),
                });
            }
        },
        addMyTransfer(data) {
            const event = data.detail;
            const hash  = event.transactionHash;

            this.tokenTranfers[hash] = {
                hash: hash,
                from: event.from,
                to: event.to,
                amount: Number(event.value),
            };
        },
        addDeposit(data) {
            const deposit = data.detail;
            const hash = deposit.transactionHash;

            Vue.set(this.poolTransfers, hash, {
                hash: hash,
                from: event.from,
                to: event.to,
                amount: Number(event.value),
                created: event.created,
            });
        },
        addWithdrawel(data) {
            const withdrawel = data.detail;
            const hash = withdrawel.transactionHash;

            Vue.set(this.poolTransfers, hash, {
                hash: hash,
                from: event.from,
                to: event.to,
                amount: Number(event.value),
            });
        }
    }
}
</script>
