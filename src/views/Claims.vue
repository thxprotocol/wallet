<template>
    <div>
        <b-container>
            <b-row class="mb-4">
                <b-col>{{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected' }}</b-col>
                <b-col>
                    <b-button class="float-right" @click="connect" :hidden="isConnected">Connect metamask</b-button>
                </b-col>
            </b-row>

            <b-row class="mb-4" v-if="isConnected && getCurrentAmountOfTokens().length > 0">
                <b-col>{{ 'You have ' + getCurrentAmountOfTokens().length + ' tokens to claim' }}</b-col>
                <b-col>
                    <b-button class="float-right" @click="payAllRewards">Claim all tokens</b-button>
                </b-col>
            </b-row>

            <b-row class="mb-4" v-else-if="isConnected">
                <b-col>{{ 'You have no tokens to claim' }}</b-col>
            </b-row>

            <div class="mb-4" v-if="isConnected && getCurrentAmountOfTokens().length > 0">
                <b-row class="mb-4" v-for="item in token" :key="item.name">
                    {{ item.name }}
                </b-row>
            </div>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
// TODO: insert abi from our smart contract
import { default as ABIThx } from '../json/ABITHX.json';
import { Contract } from 'web3-eth-contract';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    web3!: Web3;
    contract!: Contract;
    token!: any;

    async connect() {
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(ABIThx as any, this.account);
    }

    async getCurrentAmountOfTokens() {
        this.token = await this.contract.methods.getRewards().call();
        return this.token;
    }

    async payAllRewards() {
        await this.contract.methods.withdrawal().call();
    }

    async payOneReward() {
      //await this.contract.methods
    }

    mounted() {
        this.web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
    }
}
</script>
