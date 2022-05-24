<template>
    <section>
      <div>        
        {{ isConnected ? 'connected' : 'not connected' }}
        {{ account }}
        <b-button @click="connect" :disabled="isConnected">Connect metamask </b-button><br />
        {{ chainId }}
        <b-button @click="switchNetwork(networkExpected)" :disabled="!isConnected">Switch network </b-button>
      </div>
      <div>
        Hoeveel heb je gestaked
      </div>
      <div>
        klok met einddatum van je timestamp
      </div>
      <div>
        tokens die in de feecollector zitten in %%
      </div>
      <div>
        Next reward calc
      </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId', 'web3']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claim extends Vue {
    account!: string;
    chainId!: number;
    web3!: Web3;

    async connect() {
        await this.$store.dispatch('metamask/connect');
        // const contract = new this.web3.eth.Contract(abi, address)
    }
    async switchNetwork(networkId: number) {
        this.$store.dispatch('metamask/requestSwitchNetwork', networkId);
    }

    get networkExpected() {
        return this.chainId === 31337 ? 1 : 31337;
    }

    created() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');
    }
}
</script>
