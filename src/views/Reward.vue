<template>
  <article class="region region--container">
    <main class="region region--content">
      <h1>+ {{ amount }}</h1>
      <p>for:</p>
      <ul class="list" v-if="rewards">
        <li v-bind:key="rwrd.id" v-for="rwrd in rewards">
          <strong>{{ rwrd.name }}</strong>
        </li>
      </ul>
    </main>
  </article>
</template>

<script>
import NetworkService from '../services/NetworkService.js'

export default {
  name: 'reward',
  data: function () {
    return {
      network: null,
      amount: 0,
      rewards: {
        name: ""
      },
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
      this.rewards = await this.getRewardList(this.lastId)
    },
    async getRewardList(lastId) {
      const pool = this.network.instances.pool;
      // let amountOfRewards = parseInt( await this.pool.methods.count().call() )
      let amountOfRewards = 14; // @ TODO get the correct count from the rewardpool for all the beneficiary rewards.
      let rewardIds = []

      // Grab all the ID's of rewards for this beneficiaries.
      for (var i = 0; i < amountOfRewards; i++) {
        let rewardId = await pool.methods.beneficiaries(this.network.accounts[0], i).call()
        // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
        // add it to the array of items the user should see.
        if (parseInt(rewardId) > parseInt(lastId)) {
          rewardIds.push(rewardId)
        }
      }

      // Check if we have new items to show in our reward screen.
      let lastSeen = rewardIds[rewardIds.length - 1];
      if (typeof lastSeen !== 'undefined') {
        localStorage.setItem('lastId', lastSeen);
      }
      else {
        // Nothing new here, move to the account.
        this.$router.push('account');
      }

      let rewardsCount = rewardIds.length;
      let amount = 0;
      let rewardSlug = []

      // Generate an array of data to be used in the markup.
      for (var key = 0; key < rewardsCount; key++) {
        let rwrd = await pool.methods.rewards(rewardIds[key]).call()
        amount = parseInt(amount) + parseInt(rwrd.amount);
        rewardSlug.push({"name": rwrd.slug});
      }

      // Update the amount.
      this.amount = amount;

      // Return the slugs of all the approved withdrawals the user got tokens for.
      return rewardSlug;
    },
  }
}
</script>
