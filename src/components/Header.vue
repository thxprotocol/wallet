<template>
<header class="region region--header">
    <button v-on:click="goToAccount()" class="link-settings">
        <img src="../assets/menu.svg" alt="Menu icon" />
    </button>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.token}} THX</span></p>
        <p><span>{{balance.tokenRinkeby}} THX</span> | <span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script>
import EventAggregator from '../services/EventAggregator';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'Header',
    data: function() {
        return {
            ea: new EventAggregator(),
            balance: {
                eth: 0,
                token: 0,
                tokenRinkeby: 0,
            },
        }
    },
    created() {
        this.ea.listen('event.Transfer', this.updateBalance);
    },
    methods: {
        async updateBalance() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const tokenRinkeby = THX.network.instances.tokenRinkeby;
            const address = THX.network.account.address;
            const addressRinkeby = THX.network.rinkeby.account.address;
            let balanceInWei;

            balanceInWei = await THX.network.rinkeby.eth.getBalance(addressRinkeby);
            this.balance.eth = THX.network.rinkeby.utils.fromWei(balanceInWei, 'ether');

            balanceInWei = await token.methods.balanceOf(address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

            balanceInWei = await tokenRinkeby.methods.balanceOf(addressRinkeby).call();
            this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
        },
        goToAccount() {
            this.$router.replace('/account');
        }
    }
}
</script>
