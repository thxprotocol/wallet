<template>
  <div>
    <b-container class="bv-example-row">
      <b-row class="mb-2">
        <b-col>{{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected' }}</b-col>
        <b-col><b-button class="float-right" @click="connect" :hidden="isConnected">Connect metamask</b-button></b-col>
      </b-row>

      <b-row class="mb-2" v-if="isConnected">
        <b-col>{{getCurrentAmountOfTokens() > 0 ? 'You have ' + getCurrentAmountOfTokens() + ' tokens to claim' : 'You have no tokens to claim'}}</b-col>
        <b-col><b-button class="float-right" v-if="getCurrentAmountOfTokens() > 0">Claim all tokens</b-button></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import {mapGetters, mapState} from 'vuex';
import Web3 from "web3";
// TODO: insert abi from our smart contract
import {default as ABIThx} from '@thxnetwork/artifacts/dist/exports/abis/ABITHX.json';
import {Contract} from "web3-eth-contract";

@Component({
  computed: {...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected'])},
})
export default class Claims extends Vue {
  account!: string;
  web3!: Web3;
  contract!: Contract;

  async connect() {
    await this.$store.dispatch('metamask/connect');
    // TODO: insert abi from our smart contract
    this.contract = new this.web3.eth.Contract(ABIThx as any, this.account as any);
    //this.getCurrentAmountOfTokens();
  }

  async getCurrentAmountOfTokens() {
    console.log(this.contract);
    return await this.contract.methods.getRewards().call();
  }

  mounted() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
  }

}
</script>
