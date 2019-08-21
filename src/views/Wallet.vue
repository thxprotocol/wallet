<template>
<article class="region region--container">
    <main class="region region--content">
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
import Vue from 'vue';
import EventService from '../services/EventService';

export default {
    name: 'home',
    computed: {
        orderedTokenTransfers: function () {
            let arr = [];
            for (let hash in this.tokenTransfers) arr.unshift(this.tokenTransfers[hash]);
            return arr
        }
    },
    data: function() {
        return {
            events: new EventService(),
            tokenTransfers: {},
        }
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            const THX = window.THX;
            const token = await THX.network.instances.token;
            const fromBlock = await this.getCurrentBlockId();
            const offset = 10000;
            const address = THX.network.account.address;

            this.$parent.$refs.header.updateBalance();

            this.events.listen('event.Transfer', this.addMyTransfer);
            this.events.listen('event.Deposited', this.addDeposit);
            this.events.listen('event.Withdrawn', this.addWithdrawel);

            token.getPastEvents('Transfer', {
                filter: { from: address },
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addMyTransfers(events);
            });

            token.getPastEvents('Transfer', {
                filter: { to: address },
                fromBlock: (fromBlock - offset),
                toBlock: 'latest'
            }, (error, events) => {
                this.addMyTransfers(events);
            });
        },
        getCurrentBlockId() {
            const THX = window.THX;
            return THX.network.loom.eth.getBlockNumber().then(data => {
                return data;
            });
        },
        addMyTransfers(data) {
            const THX = window.THX;
            const utils = THX.network.loom.utils;

            for (let key in data) {
                const hash = data[key].transactionHash;
                const value = data[key].returnValues;
                const from = (value.from) ? value.from.toLowerCase(): '';
                const to = (value.to) ? value.to.toLowerCase(): '';
                const amount = utils.fromWei(value.value, 'ether');

                this._createTransfer(hash, from, to, amount);
            }
        },
        addMyTransfer(data) {
            const THX = window.THX;
            const utils = THX.network.loom.utils;
            const value = data.detail;
            const hash  = event.transactionHash;
            const from = (value.from) ? value.from.toLowerCase(): '';
            const to = (value.to) ? value.to.toLowerCase(): '';
            const amount = utils.fromWei(value.value, 'ether');

            this._createTransfer(hash, from, to, amount);

            this.$parent.$refs.header.updateBalance();
        },
        _createTransfer(hash, from, to, amount) {
            Vue.set(this.tokenTransfers, hash, {
                hash: hash,
                from: from,
                to: to,
                amount: Number(amount),
            });
        }
    }
}
</script>
