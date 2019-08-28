<template>
<article class="region region--container">
    <main class="region region--content">

        <div class="text-center" v-if="!orderedTokenTransfers.length">
            <b-spinner label="Loading..."></b-spinner>
        </div>

        <b-list-group v-if="orderedTokenTransfers">
            <b-list-group-item v-bind:key="transfer.hash" v-for="transfer in orderedTokenTransfers" variant="transfer.variant">
                <div class="d-flex w-100 justify-content-between">
                    <strong>{{transfer.amount}} THX</strong>
                    <small>{{ transfer.timestamp | moment("MMMM Do YYYY HH:mm") }}</small>
                </div>
                <small class="mb-1">From: {{transfer.from}}</small><br>
                <small class="mb-1">To: {{transfer.to}}</small>
            </b-list-group-item>
        </b-list-group>

    </main>
</article>
</template>

<script>
import Vue from 'vue';
import EventService from '../services/EventService';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';

export default {
    name: 'home',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
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
                const timestamp = data[key].blockTime;

                this._createTransfer(hash, from, to, amount, timestamp);
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
            const timestamp = event.blockTime;

            this._createTransfer(hash, from, to, amount, timestamp);

            this.$parent.$refs.header.updateBalance();
        },
        _createTransfer(hash, from, to, amount, timestamp) {
            Vue.set(this.tokenTransfers, hash, {
                hash: hash,
                from: from,
                to: to,
                amount: Number(amount),
                timestamp: timestamp,
            });
        }
    }
}
</script>
