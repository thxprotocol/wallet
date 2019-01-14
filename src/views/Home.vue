<template>
  <div class="home">
    <h1>This is the homepage</h1>
    Balance: {{ balance }}
  </div>
</template>

<script>


export default {
  name: 'home',
  props: {
    providerURL: "http://localhost:8545"
  },
  methods: {
    init() {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      } else {
        web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL))
      }

      console.log(`Running web3 version: ${web3.version.api}`)

      // Let's request the balance for the MetaMask account
      const accounts = web3.eth.accounts

      this.getBalance(accounts[0]).then((result) => {
        // Since this method returns a BigNumber convert it to a Number first
        var balanceInWei = result.toNumber()

        // Calculate the amount of ETH represented by this Number, be careful! a string is returned:)
        this.balance = web3.fromWei(balanceInWei, 'ether')
      });

    },
    getBalance (address) {
      // Ethereum blockchain interactions can only be Promises, set them up
      // for every web3.eth method you want to use.
      return new Promise (function (resolve, reject) {
        web3.eth.getBalance(address, function (error, result) {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        })
      })
    }
  },
  data: function () {
    return {
      balance: 0
    }
  },
  mounted() {
    this.init()
  }
}
</script>
