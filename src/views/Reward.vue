<template>
  <article class="region region--container">
    <main class="region region--content">
      <h1>+ {{ reward.amount }}</h1>
      <p>for:</p>
      <strong>{{ reward.name }}</strong>

      <ul class="list list--nav">
        <li v-bind:key="r.id" v-for="r in rewards">
          <a href="{{ this.$}}"
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
      id: 0,
      reward:  {
        amount: 0,
        name: ""
      },
      rewards: {
        id: ""
      },
      lastId: -1
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
      this.reward = await this.getReward(this.$route.params.id)
      this.rewards = await this.getRewardList(this.lastId)
    },
    async getReward(rewardId) {
      const pool = this.network.instances.pool
      let loadedReward = await pool.methods.rewards(rewardId).call()

      let reward = [];
      // Get current reward data from URL.
      if (typeof loadedReward !== 'undefined') {
        reward.amount = loadedReward.amount;
        reward.name = loadedReward.slug;

        return reward;
      }

      return []
    },
    async getRewardList(lastId) {
      const pool = this.network.instances.pool
      let amountOfRewards = parseInt( await pool.methods.countRewardsOf(this.network.accounts[0]).call() )
      let rewardIds = []

      // Grab all the ID's of rewards for this beneficiaries.
      for (var i = 0; i < amountOfRewards; i++) {
        let rewardId = await pool.methods.beneficiaries(this.network.accounts[0], i).call()
        // If the reward ID of this address is new (aka the ID is higher than the last one generated) we
        // add it to the array of items the user should see.
        if (parseInt(rewardId) > parseInt(lastId)) {
          rewardIds.push({'id': rewardId})
        }
      }

      return rewardIds;
    },
  }
}
</script>
