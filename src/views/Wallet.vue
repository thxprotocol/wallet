<template>
  <article class="region region--container">
    <Header />
    <main class="region region--content">
      <ul class="list list--dotted">
        <li>Greenpeace Greenwire <strong>+200</strong></li>
        <li>Greenpeace Greenwire <strong>+50</strong></li>
      </ul>
    </main>
  </article>
</template>

<script>
/*globals web3:true*/
import Web3 from 'web3'

import TokenJSON from '../../build/contracts/THXToken.json'
import RewardPoolJSON from '../../build/contracts/RewardPool.json'

import Header from '../components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  },
  data: function () {
    return {
      poolName: "",
      providerURL: "http://localhost:8545",
      accounts: [],
      tokenAddress: null,
      rewardPoolAddress: null,
      tokenInstance: null,
      RewardPoolInstance: null,
    }
  },
  async mounted() {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
    }

    // Get the network id
    const nid = await web3.eth.net.getId()

    if (typeof TokenJSON.networks[nid] != 'undefined' && typeof RewardPoolJSON.networks[nid] != 'undefined') {
      // Get the contract addresses
      this.tokenAddress = TokenJSON.networks[nid].address
      this.rewardPoolAddress = RewardPoolJSON.networks[nid].address

      // Create an instance from the THXToken Contract abi and contract address on the current network
      this.tokenInstance = new web3.eth.Contract(TokenJSON.abi, this.tokenAddress)
      this.rewardPoolInstance = new web3.eth.Contract(RewardPoolJSON.abi, this.rewardPoolAddress)

      this.init()
    }
    else {
      // eslint-disable-next-line
      console.log('Migrate your contracts first!')
    }

  },
  methods: {
    async init() {

      this.poolName = await this.rewardPoolInstance.methods.name().call()

      // Retrieve the accounts available on the network
      await web3.eth.getAccounts((error, accounts) => {
        // Store the accounts
        this.accounts = accounts
      })
    }
  }
}
</script>
