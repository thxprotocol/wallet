<template>
<header class="region region--header">
    <div class="logo">
        <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
    </div>
    <div class="account_balance">
        <p>Your balance (THX | ETH)</p>
        <p><span class="font-size-large">{{balance.token}}</span></p>
        <p><span class="font-size-large">{{balance.eth}}</span></p>
    </div>
</header>
</template>

<script>
import Logo from '../assets/thx_logo.svg'

const THX = window.THX;

export default {
    name: 'Header',
    data: function() {
        return {
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
        THX.ns.connect().then(() => this.init());
    },
    methods: {
        init() {
            this.updateBalance()
        },
        async updateBalance() {
            const token = THX.ns.instances.token;

            this.balance.token = await token.methods.balanceOf(THX.ns.accounts[0]).call()

            const balanceInWei = await THX.ns.web3.eth.getBalance(THX.ns.accounts[0])
            const balanceInEth = THX.ns.web3.utils.fromWei(balanceInWei,'ether')

            this.balance.eth = Number(balanceInEth).toFixed(2)
        }
    }
}
</script>
