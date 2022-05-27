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
          <p><strong>Connected account: {{ account }}</strong></p>
        </div>
      </div>

      <template v-if="isConnected">
        <div v-if="stakedThx == '0'">
          <div class="w-100 text-center" v-if="busy">
              <b-spinner variant="dark" />
          </div>
          <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
          <div>
            <form @submit.prevent="onSubmit()" id="formPassword">
              <b-form-group label="Amount: " label-for="amountValue" description="how much $THX do you want to stake?">
                <b-form-input
                    id="amountValue"
                    size="lg"
                    v-model="stakeAmount"
                    type="number"
                    placeholder="Enter amount"
                />
              </b-form-group>
              <b-form-group label="Time: " label-for="timeValue" description="how long do you want to stake?">
                <b-form-input
                    id="timeValue"
                    size="lg"
                    v-model="timeAmount"
                    type="number"
                    placeholder="Enter amount"
                />
              </b-form-group>
              <b-button type="submit" variant="primary">Submit</b-button>
            </form>

          </div>
        </div>
        <div class="row" v-else="stakedAmount">
          <b-card class="col-sm" title="Balances">
            <b-list-group flush>
              <b-list-group-item button class="d-flex justify-content-between align-items-center"><strong>$THX</strong>{{thxAmount}}</b-list-group-item>
              <b-list-group-item button class="d-flex justify-content-between align-items-center"><strong>$stTHX</strong>{{stakedThx}}</b-list-group-item>
            </b-list-group>
          </b-card>
          <b-card class="col-sm">
            Your locktime period expires in 23 days
          </b-card>
        </div>
        <div class="row">
          <b-card class="col-sm" title="Tokens in fee collector">
            <b-list-group flush>
              <b-list-group-item button class="d-flex justify-content-between align-items-center">ExampleToken1</b-list-group-item>
              <b-list-group-item button class="d-flex justify-content-between align-items-center">ExampleToken2</b-list-group-item>
              <b-list-group-item button class="d-flex justify-content-between align-items-center">ExampleToken2</b-list-group-item>
              <b-list-group-item button class="d-flex justify-content-between align-items-center">ExampleToken2</b-list-group-item>
            </b-list-group>
            <small>Time till next rewards: 3 days</small>
          </b-card>
          <b-card class="col-sm">
            Current reward balance
          </b-card>
          <b-card title="add more tokens" class="col-sm">
            <form @submit.prevent="onSubmit()" id="formPassword">
              <b-form-group label="Amount: " label-for="amountValue" description="how much $THX do you want to stake?">
                <b-form-input
                    id="amountValue"
                    size="lg"
                    v-model="stakeAmount"
                    type="number"
                    placeholder="Enter amount"
                />
              </b-form-group>
              <b-form-group label="Time: " label-for="timeValue" description="how long do you want to stake?">
                <b-form-input
                    id="timeValue"
                    size="lg"
                    v-model="timeAmount"
                    type="number"
                    placeholder="Enter amount"
                />
              </b-form-group>
              <b-button type="submit" variant="primary">Submit</b-button>
            </form>
          </b-card>
        </div>
      </template>
      </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';

import { default as tokenTimeLockAbi } from '../artifacts/tokenTimeLock.json';
import { default as unlimitedSupplyTokenAbi } from '../artifacts/unlimitedSupplyToken.json';
import { default as limitedSupplyTokenAbi } from '../artifacts/limitedTokenSupply.json';

import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

@Component({
    name: "claimAndStakeComponent",
    components: {
        'b-form-input': BFormInput,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
    computed: { ...mapState('metamask', ['account', 'chainId', 'web3']), ...mapGetters('metamask', ['isConnected']) },
})

export default class Claim extends Vue {
    busy = false;
    error = '';
    stakeAmount = '';
    timeAmount = '';
    stakedThx = '';
    thxAmount = '';

    account!: string;
    chainId!: number;
    web3!: Web3;
    contract!: Contract;
    stakedAmount!: boolean;

    async connect() {
      this.error = '';
        try {
          await this.$store.dispatch('metamask/connect');
          this.stakedAmount = false;
          this.contract = new this.web3.eth.Contract(tokenTimeLockAbi as AbiItem[], "0x3eF13AcF26776BfEd682732ae34cBC86bb355862")
          const stakedContract = new this.web3.eth.Contract(unlimitedSupplyTokenAbi as AbiItem[], "0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8")
          const thxToken = new this.web3.eth.Contract(limitedSupplyTokenAbi as AbiItem[], "0xB952d9b5de7804691e7936E88915A669B15822ef")

          const thxBalance = await thxToken.methods.balanceOf(this.account).call()
          this.thxAmount =  this.web3.utils.fromWei(thxBalance, 'ether');

          const response = await stakedContract.methods.balanceOf(this.account).call()
          console.log(response)
          if (response !== 0) {this.stakedThx =  this.web3.utils.fromWei(response, 'ether');}

        } catch (error) {
          this.error = (error as Error).message;
        }
    }

    async collectData() {
      this.stakedAmount = false;
      const stakedContract = new this.web3.eth.Contract(unlimitedSupplyTokenAbi as AbiItem[], "0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8")
      try {
        const response = await stakedContract.methods.balanceOf(this.account).call();
        console.log("staked amount: ", response, this.stakedAmount)

        await this.collectThxBalance()

        if (response !== 0) this.stakedThx = response
      } catch (err) {
        console.log(err)
      }
    }

    async collectThxBalance() {
      // 0xB952d9b5de7804691e7936E88915A669B15822ef
      const thxSupplyToken = new this.web3.eth.Contract(limitedSupplyTokenAbi as AbiItem[], "0xB952d9b5de7804691e7936E88915A669B15822ef")

      try {
        const response = await thxSupplyToken.methods.balanceOf(this.account).call();
        console.log("thx amount: ", response, " ", this.account)

        // if (response == 0) this.stakedAmount = false
        // else this.stakedAmount = true
      } catch (err) {
        console.log(err)
      }
    }

    async switchNetwork(networkId: number) {
        this.$store.dispatch('metamask/requestSwitchNetwork', networkId);
    }

    async onSubmit() {
        this.busy = true;
        this.error = '';
        try {
            console.log("Amount that the user wants to stake: ", this.stakeAmount)

            if (Number(this.stakeAmount) > 10) {
              if (!this.contract) this.contract = new this.web3.eth.Contract(tokenTimeLockAbi as AbiItem[], "0x3eF13AcF26776BfEd682732ae34cBC86bb355862")
              const thxSupplyToken = new this.web3.eth.Contract(limitedSupplyTokenAbi as AbiItem[], "0xB952d9b5de7804691e7936E88915A669B15822ef")
              const stakedContract = new this.web3.eth.Contract(unlimitedSupplyTokenAbi as AbiItem[], "0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8")

              const sendThxToken = await thxSupplyToken.methods.approve("0x3eF13AcF26776BfEd682732ae34cBC86bb355862", this.web3.utils.toWei(this.stakeAmount, 'ether')).send({from: this.account})
                .then(async (res: any) => {
                  console.log(res)
                  const deposit = await this.contract.methods.deposit(this.web3.utils.toWei(this.stakeAmount, 'ether'), 4).send({from: this.account})
                }).then(async () => {
                  const stakedThxBalance = await stakedContract.methods.balanceOf(this.account).call()
                  const thxBalance = await thxSupplyToken.methods.balanceOf(this.account).call()
                  if (stakedThxBalance) this.stakedAmount = true 
                  return  { stakedThxBalance, thxBalance }
                })
            }
            else this.error = "Je moet minimaal 10 $THX staken"
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.busy = false;
        }
    }

    get networkExpected() {
        return this.chainId === 31337 ? 1 : 31337;
    }

    created() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');
    }

    mounted() {
        // web3 set to hardhat provider
        this.web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
        this.connect();
    }
}
</script>
