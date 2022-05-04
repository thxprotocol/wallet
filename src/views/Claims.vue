<template>
    <div>
        <b-container>
            <b-row class="mb-4">
                <b-col>{{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected' }}</b-col>
                <b-col>
                    <b-button class="float-right" @click="connect" :hidden="isConnected">Connect metamask</b-button>
                </b-col>
            </b-row>

            <b-row class="mb-4" v-if="isConnected && reward > 0">
                <b-col>{{ 'You have ' + reward + ' tokens to claim' }}</b-col>
                <b-col>
                    <b-button class="float-right" @click="payAllRewards">Claim all tokens</b-button>
                </b-col>
            </b-row>

            <b-row class="mb-4" v-else-if="isConnected">
                <b-col>{{ 'You have no tokens to claim' }}</b-col>
            </b-row>

<!--            <div class="mb-4" v-if="isConnected && reward > 0">-->
<!--                <b-row class="mb-4" v-for="item in tokenAndAmount" :key="item.token, item.amount">-->
<!--                    {{ item.token }}-->
<!--                    {{ item.amount }}-->
<!--                </b-row>-->
<!--            </div>-->
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { default as ABI_THX } from '../json/ABITHX.json';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    web3!: Web3;
    contract!: Contract;
    reward!: any;
    tokenAndAmount!: {token: string, amount: number}[];

    async connect() {
        const address = "0x5E0A87862f9175493Cc1d02199ad18Eff87Eb400"
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(ABI_THX as any, address);
    }

    async updateReward() {
        const positionAddress = 0;
        const positonAmount = 2;
        let _amount!: any;
        this.reward = 0;
        const response = await this.contract.methods.getRewards().call();


      for (let i = 0; i < response.length; i++) {
            _amount = Number(response[i][positonAmount]._hex.toString())
            this.reward += _amount;
            this.tokenAndAmount.push([{token:response[i][positionAddress].toString(), amount: _amount }])
        }
        console.log('reward: ' + this.reward);
    }

    async payAllRewards() {
        await this.contract.methods.withdrawBulk().call();
    }

    mounted() {
        // set to hardhat provider
        this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        this.updateReward();
    }
}
</script>
