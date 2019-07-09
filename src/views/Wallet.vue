<template>
<article class="region region--container">
    <Header />
    <main class="region region--content">
        <strong v-if="!transactions">Loading...</strong>
        {{ pool.name }}
        <ul class="list list--dotted" v-if="transactions">
            <!-- <li v-bind:key="`${tx.id}`" v-for="tx in transactions">
          {{ pool.name }}
          <strong>
            <span>{{ (tx.receiver == network.accounts[0]) ? '+' : '-' }}</span>
             {{ tx.amount }}
          </strong>
        </li> -->
            <li v-bind:key="`${tx.hash}`" v-for="tx in transactions">
                <div style="overflow:hidden; display: block; text-overflow: ellipsis;">{{ tx.hash }}</div>
                <div><small>Receiver: <strong>{{ tx.receiver }}</strong></small></div>
                <div><small>Confirmed: <strong>{{ tx.confirmations }}</strong></small></div>
            </li>
        </ul>
    </main>
</article>
</template>

<script>
import Header from '../components/Header.vue'
import EventService from '../services/EventService.js';
import Vue from 'vue';

const THX = window.THX;

export default {
    name: 'home',
    components: {
        Header
    },
    data: function() {
        return {
            network: null,
            pool: {
                name: "",
                balance: 0
            },
            transactions: {},
            timer: null,
            ea: new EventService(),
        }
    },
    created() {
        // eslint-disable-next-line
        THX.ns.connect().then(() => this.init()).catch(() => console.error);
    },
    beforeDestroy: function() {
        if (this.timer) clearInterval(this.timer);
    },
    methods: {
        async init() {
            const pool = THX.ns.instances.pool;
            this.pool.name = await pool.methods.name().call();
            const interval = 10000; // How many ms between getConfirmation calls

            if (this.timer) clearInterval(this.timer);
            this.txList = JSON.parse(localStorage.getItem('tx'));

            if (this.txList) {
                this.getConfirmations();
                this.timer = setInterval(this.getConfirmations.bind(this), interval);
            }

            this.ea.listen('tx.confirmation', (data) => {
                this.tx = {
                    hash: data.detail.hash,
                    confirmations: data.detail.confirmations
                }
            });
        },
        async getConfirmations() {
            for (let hash of this.txList) {
                Vue.set(this.transactions, hash, await this.getDetails(hash));
            }
        },
        async getDetails(hash) {
            const tx = await THX.ns.web3.eth.getTransaction(hash);
            const data = THX.ns.web3.eth.abi.decodeParameters(['address'], tx.input);
            const currentBlock = await THX.ns.web3.eth.getBlockNumber();

            return {
                receiver: data[0],
                hash: hash,
                confirmations: (tx.blockNumber === null) ? 0 : currentBlock - tx.blockNumber
            }
        }
    }
}
</script>
