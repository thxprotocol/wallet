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
    methods: {
        async init() {
            const pool = THX.ns.instances.pool;
            this.pool.name = await pool.methods.name().call();
        }
    }
}
</script>
