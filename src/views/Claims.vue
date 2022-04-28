<template>
    <div>
        {{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected'}}
        <b-button @click="connect" :hidden="isConnected">Connect metamask </b-button><br />
        <b-button v-if="getCurrentAmountOfTokens() > 0">Claim tokens </b-button><br />
        <p>The current amount of tokens is:  {{ getCurrentAmountOfTokens() }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from "web3";
// TODO: insert abi from our smart contract
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import {Contract} from "web3-eth-contract";

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    chainId!: number;
    web3!: Web3;
    contract!: Contract;


    async connect() {
        this.$store.dispatch('metamask/connect');
    }

    async getCurrentAmountOfTokens() {
        return await this.contract.methods.getRewards().call();
    }

    mounted() {
      this.web3 =  new Web3(new Web3.providers.HttpProvider(''));
      // TODO: insert abi from our smart contract
      this.contract = new this.web3.eth.Contract(ERC20Abi as any, this.account as any);
    }

}
</script>
