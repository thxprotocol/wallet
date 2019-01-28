<template>
<header class="region region--header">
    <div class="logo">
        <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
    </div>
    <div class="account_balance">
        <p>Your balance (THX | ETH)</p>
        <p><span class="font-size-large" v-html="balance.token"></span></p>
        <p><span class="font-size-large" v-html="balance.eth"></span></p>
    </div>
</header>
</template>

<script>
import NetworkService from '../services/NetworkService.js'
import Logo from '../assets/thx_logo.svg'

export default {
    name: 'Header',
    data: function() {
        return {
            networkService: new NetworkService(),
            network: null,
            assets: {
                logo: Logo
            },
            balance: {
                eth: 0,
                token: 0
            }
        }
    },
    mounted() {
        new NetworkService().connect().then((network) => {
            this.network = network
            this.init()
        })
    },
    methods: {
        init() {
            this.updateBalance()
        },
        async updateBalance() {
            const token = this.network.instances.token;
            this.balance.token = await token.methods.balanceOf(this.network.accounts[0]).call()

            const balanceInWei = await this.networkService.web3.eth.getBalance(this.network.accounts[0])
            const balanceInEth = this.networkService.web3.utils.fromWei(balanceInWei,'ether')

            this.balance.eth = Number(balanceInEth).toFixed(2)
        }
    }
}
</script>
