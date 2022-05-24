<template>
    <div class="container-fluid" v-if="!isConnected">
      <div class="d-flex align-items-center justify-content-center flex-column">        
        {{ isConnected ? 'connected' : 'not connected' }}
        <b-button class="p-2" @click="connect" :disabled="isConnected">Connect metamask </b-button><br />
      </div>
    </div>
    <div class="container-fluid" v-else>
      <div class="row">
        <div class="col-sm">
          Connected with: {{ account }}
        </div>
        <div class="col-sm">
          <b-button class="p-2" @click="collectData">Check </b-button>
        </div>
      </div>

      <template v-if="isConnected">
        <div v-if="!stakedAmount">
          <div>
          <b-form @submit="collectData">
            <b-form-group
              id="input-group-1"
              label="Amount:"
              label-for="input-1"
              description="how much $THX do you want to stake?"
            >
              <b-form-input
                id="input-1"
                type="number"
                placeholder="Enter amount"
                required
              ></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
          </b-form>
          </div>
        </div>
        <div class="row" v-else="stakedAmount">
          <div class="col-sm">
            Hoeveel is er gestaked?
          </div>
          <div class="col-sm">
            klok met einddatum
          </div>
          <div class="col-sm">
            <b-button class="p-2" @click="collectData">Check </b-button>
          </div>
        </div>
      </template>
      </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { default as tokenTimeLockAbi } from '../artifacts/tokenTimeLock.json';
import { default as unlimitedSupplyTokenAbi } from '../artifacts/unlimitedSupplyToken.json';
import { default as stakeForm } from '../components/stakedTokenForm.vue'

import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId', 'web3']), ...mapGetters('metamask', ['isConnected']) },
})

export default class Claim extends Vue {
    account!: string;
    chainId!: number;
    web3!: Web3;
    contract!: Contract;
    stakedAmount!: boolean;

    async connect() {
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(tokenTimeLockAbi as AbiItem[], "0x3eF13AcF26776BfEd682732ae34cBC86bb355862")
        if (this.contract) console.log(this.contract)
        await this.collectData()
    }

    async collectData() {
      this.stakedAmount = false;
      const stakedContract = new this.web3.eth.Contract(unlimitedSupplyTokenAbi as AbiItem[], "0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8")
      try {
        const response = await stakedContract.methods.balanceOf(this.account).call();
        console.log("staked amount: ", response, this.stakedAmount)

        if (response == 0) this.stakedAmount = false
        else this.stakedAmount = true
      } catch (err) {
        console.log(err)
      }
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
