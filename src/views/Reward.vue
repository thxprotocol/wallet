<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted" v-if="transactions">
        <li v-bind:key="tx.id" v-for="tx in transactions">
          {{ pool.name }} <strong>+ {{ tx.amount }}</strong>
        </li>
      </ul>
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
      approvals: [],
      lastId: 0
    }
  },
  created() {
    new NetworkService().connect().then((network) => {
      this.network = network
      this.init()
    })
  },
  mounted() {
    if (localStorage.lastId) {
      this.lastId = localStorage.lastId;
    }
  },
  methods: {
    async init() {
      const pool = this.network.instances.pool;

      this.approvals = await this.getNewestApprovedWithdrawals(this.lastId)
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
    async getNewestApprovedWithdrawals(lastId) {
      const pool = this.network.instances.pool;
      let amountOfRewards = parseInt( await pool.methods.count().call() )

      let rewardIds = []
      let userRewards = []
      // Grab all the ID's of rewards for this beneficiaries.
      // @TODO MAKE MORE PERFORMANT!!!!!
      // @todo defensive coding per favore.
      for (var i = 0; i < amountOfRewards; i++) {
        let rewardId = await pool.methods.beneficiaries(this.network.accounts[0], i).call()
        // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
        // add it to the array of items the user should see.
        if (rewardId > lastId) {
          rewardIds.push(rewardId)
        }
      }

      let lastSeen = rewardIds[rewardIds.length - 1];

      if (typeof lastSeen !== 'undefined') {
        localStorage.setItem('lastId', lastSeen);
      }

      // Generate an array of.
      let rewardsCount = rewardIds.length;
      for (var key = 0; key < rewardsCount; key++) {
        let rwrd = await pool.methods.rewards(rewardIds[key]).call()
        userRewards.push(rwrd.id)
        console.log(rwrd.amount)
      }

      return userRewards;
    }
  }
}
</script>
