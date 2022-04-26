<template>
    <div>
        {{ isConnected ? 'connected' : 'not connected' }}
        {{ account }}
        <b-button @click="connect" :disabled="isConnected">Connect metamask </b-button><br />
        {{ chainId }}
        <b-button @click="switchNetwork(networkExpected)" :disabled="!isConnected">Switch network </b-button><br />
        <b-button>Claim tokens </b-button><br />
        <p>The current amount of tokens is:  {{ getCurrentAmountOfTokens }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from "web3";
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    chainId!: number;
    web3!: Web3;

    async connect() {
        this.$store.dispatch('metamask/connect');
    }

    async switchNetwork(networkId: number) {
        this.$store.dispatch('metamask/requestSwitchNetwork', networkId);
    }

    get networkExpected() {
        return this.chainId === 31337 ? 1 : 31337;
    }

    get getCurrentAmountOfTokens() {
      return this.$store.dispatch('')
    }

    mounted() {
      // balance ophalen op voorhand.
      this.web3 = new Web3(new Web3.providers.HttpProvider(''));
      this.web3 =  new Web3(ERC20Abi as any, this.account as any);
      console.log("");
    }

}
</script>
