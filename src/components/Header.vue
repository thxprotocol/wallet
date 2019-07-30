<template>
<header class="region region--header">
    <button v-on:click="goToAccount()" class="link-settings">
        <img src="../assets/menu.svg" alt="Menu icon" />
    </button>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.loomTokens}} THX</span></p>
        <p><span>{{balance.ethTokens}} THX</span> | <span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script>
import EventService from '../services/EventService';

export default {
    name: 'Header',
    data: function() {
        return {
            ea: new EventService(),
            network: null,
            balance: {
                eth: 0,
                ethTokens: 0,
                loomTokens: 0,
            },
        }
    },
    created() {
        this.ea.listen('event.Transfer', this.updateBalance);
    },
    methods: {
        async updateBalance() {
            const THX = window.THX;
            const token = THX.contracts.instances.token;
            const tokenRinkeby = THX.contracts.instances.tokenRinkeby;
            const web3 = THX.contracts.ethWeb3;
            let balanceInWei;

            balanceInWei = await token.methods.balanceOf(THX.contracts.loomAddress).call();
            this.balance.loomTokens = web3.utils.fromWei(balanceInWei, "ether");

            balanceInWei = await tokenRinkeby.methods.balanceOf(THX.contracts.ethAddress).call();
            this.balance.ethTokens = web3.utils.fromWei(balanceInWei, "ether");

            balanceInWei = await web3.eth.getBalance(THX.contracts.ethAddress);
            this.balance.eth = web3.utils.fromWei(balanceInWei, "ether");
        },
        goToAccount() {
            this.$router.push('account');
        }
    }
}
</script>
