<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted" v-if="transactions">
        <li v-bind:key="tx.id" v-for="tx in transactions">
          {{ pool.name }} <strong>+ {{ tx.amount }}</strong>
        </li>
      </ul>
      <!--<ul class="list list&#45;&#45;dotted" v-if="approvals">-->
        <!--<li v-bind:key="id" v-for="id in approvals">-->
          <!--<strong>{{ id }}</strong>-->
        <!--</li>-->
      <!--</ul>-->
    </main>
  </article>
</template>

<script>
import NetworkService from '../services/NetworkService.js'
import Header from '../components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  },
  data: function () {
    return {
      network: null,
      pool: {
        name: "",
        balance: 0
      },
      transactions: [],
      approvals: []
    }
  },
  created() {
    new NetworkService().connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;

      this.approvals = await this.getApprovedWithdrawals()
      this.pool.name = await pool.methods.name().call()
      this.transactions = await this.getTransactions()
    },
    async getTransactions() {
      const pool = this.network.instances.pool;

      let transactions = []
      let amountOfRewards = parseInt( await pool.methods.count().call() )

      for (var i = 0; i < amountOfRewards; i++) {
        let tx = await pool.methods.rewards(i).call()

        transactions.push(tx)
      }

      transactions = transactions.filter((tx) => {
        return (parseInt(tx.state) == 3 && (tx.beneficiary.toUpperCase() == this.network.accounts[0].toUpperCase()))
      })

      // @TODO Also add Pool deposits to the list of tx
      // ...

      return transactions.reverse()
    },
    async getApprovedWithdrawals() {
      const pool = this.network.instances.pool;

      console.log(this.network.accounts[0]);

      // Get all approved rewards for a certain address.
      // let approvals = await pool.methods.getApprovedRewards(this.network.accounts[0]).call()
      //
      // console.log("____");
      // console.log(approvals);
      // console.log("____");

      return []
    }
  }
}
</script>
