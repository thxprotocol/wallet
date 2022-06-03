<template>
    <div class="container-fluid" v-if="!isConnected">
        <div class="d-flex align-items-center justify-content-center flex-column mt-3">
            {{ isConnected ? 'connected' : 'not connected' }}
            <b-button class="p-2 mt-3" @click="connect" :disabled="isConnected">Connect metamask </b-button><br />
        </div>
    </div>
    <div class="container-fluid" v-else>
        <div class="row">
            <div class="col-sm">
                <p>
                    <strong>Connected wallet: {{ account }}</strong>
                </p>
            </div>
            <div v-if="isConnected"><b-button @click="sendThx()" variant="secondary">Send to other user</b-button></div>
        </div>

        <template v-if="isConnected && stakedThx == '0'">
            <div>
                  <b-alert show class="mt-3">
                    <p>You dont have any $stTHX, stake your $THX tokens and receive weekly rewards. This rewards are tokens that are collected in the feecollector.</p>
                  </b-alert>
                <b-card class="mt-3" title="Balances">
                    <b-list-group flush>
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            ><strong>$THX</strong>{{ thxAmount }}</b-list-group-item
                        >
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            ><strong>$stTHX</strong>{{ stakedThx }}</b-list-group-item
                        >
                    </b-list-group>
                </b-card>
                <div class="w-100 text-center mt-3" v-if="busy">
                    <b-spinner variant="dark" />
                </div>
                <div class="mt-3" v-else>
                    <form @submit.prevent="onSubmit()" id="formPassword">
                        <b-form-group
                            label="Amount: "
                            label-for="amountValue"
                            description="how much $THX do you want to stake?"
                        >
                            <b-form-input
                                id="amountValue"
                                size="lg"
                                v-model="stakeAmount"
                                type="number"
                                placeholder="Enter amount"
                            />
                        </b-form-group>
                        <b-form-group label="Time in weeks: " label-for="timeValue" description="How many weeks do you want to stake?">
                            <b-form-input
                                id="timeValue"
                                size="lg"
                                v-model="timeAmount"
                                type="number"
                                placeholder="Enter weeks"
                            />
                        </b-form-group>
                        <b-alert show variant="danger" v-if="error">
                          {{ error }}
                        </b-alert>
                        <b-button type="submit" variant="primary">Submit</b-button>
                    </form>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="row mt-3">
              <div class="mt-3 col-sm">
                <b-card class="col-sm mt-3" title="Balances">
                    <b-list-group flush>
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            ><strong>$THX</strong>{{ thxAmount }}</b-list-group-item
                        >
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            ><strong>$stTHX</strong>{{ stakedThx }}</b-list-group-item
                        >
                    </b-list-group>
                </b-card>
              </div>
              <div class="mt-3 col-sm">
                <b-card class="col-sm mt-3">
                  <p>
                    Your locktime period expires in {{timeStamp}}
                  </p>
                  <b-button @click="collectRewards()" disabled variant="primary">Withdraw $stTHX tokens</b-button>
                </b-card>
              </div>
            </div>
            <div class="row">
              <div class="col-sm mt-3">
                <b-card class="col mt-3" title="Available token to earn">
                    <b-list-group flush>
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            >ExampleToken1<b-badge variant="secondary" pill>25%</b-badge></b-list-group-item
                        >
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            >ExampleToken2<b-badge variant="secondary" pill>25%</b-badge></b-list-group-item
                        >
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            >ExampleToken3<b-badge variant="secondary" pill>25%</b-badge></b-list-group-item
                        >
                        <b-list-group-item button class="d-flex justify-content-between align-items-center"
                            >ExampleToken4<b-badge variant="secondary" pill>25%</b-badge></b-list-group-item
                        >
                    </b-list-group>
                    <small>Every sunday rewards will be payed out</small>
                </b-card>
              </div>
              <div class="col-sm mt-3">
                <b-card title="Your rewards" class="col-sm mt-3">
                      <b-list-group flush>
                        <b-list-group-item button class="d-flex justify-content-between align-items-center" v-for="item in tokens">
                          {{item.token}}
                          <b-badge variant="secondary" pill>{{item.amount}}</b-badge>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
              </div>
              <div class="col-sm mt-3">
                <b-card title="Add more $THX tokens" class="col-sm mt-3">
                    <form @submit.prevent="onSubmit()" id="formPassword">
                        <b-form-group
                            label="Amount: "
                            label-for="amountValue"
                            description="how much $THX do you want to stake?"
                        >
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
                                placeholder="Enter weeks"
                            />
                        </b-form-group>
                        <b-button class="mt-3" type="submit" variant="primary">Submit</b-button>
                    </form>
                </b-card>
              </div>
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

import { default as tokenLib } from '../artifacts/tokenLib.json';

import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

@Component({
    name: 'claimAndStakeComponent',
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
    timeStamp = '';
    tokens : any = [];

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
            this.contract = new this.web3.eth.Contract(
                tokenTimeLockAbi as AbiItem[],
                '0x3eF13AcF26776BfEd682732ae34cBC86bb355862',
            );
            const stakedContract = new this.web3.eth.Contract(
                unlimitedSupplyTokenAbi as AbiItem[],
                '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
            );
            const thxToken = new this.web3.eth.Contract(
                limitedSupplyTokenAbi as AbiItem[],
                '0xB952d9b5de7804691e7936E88915A669B15822ef',
            );

            const thxBalance = await thxToken.methods.balanceOf(this.account).call();
            this.thxAmount = this.web3.utils.fromWei(thxBalance, 'ether');

            const response = await stakedContract.methods.balanceOf(this.account).call();
            if (response !== 0) {
                const thxSupplyToken = new this.web3.eth.Contract(
                    limitedSupplyTokenAbi as AbiItem[],
                    '0xB952d9b5de7804691e7936E88915A669B15822ef',
                );
                this.stakedThx = this.web3.utils.fromWei(response, 'ether');
                this.tokens = [];
                const stakedThxBalance = await stakedContract.methods.balanceOf(this.account).call();
                const thxBalance = await thxSupplyToken.methods.balanceOf(this.account).call();
                const contractTime = await this.contract.methods.lockTime(this.account).call()
                const secondsSinceEpoch = Math.round(Date.now() / 1000)
                const lockTime = contractTime-secondsSinceEpoch
                const time = this.secondsToDhms(lockTime)
                console.log("locktime", lockTime, time)
                this.timeStamp = time;
                this.thxAmount = this.web3.utils.fromWei(thxBalance, 'ether');
                if (stakedThxBalance) this.stakedAmount = true;
                this.stakedThx = this.web3.utils.fromWei(stakedThxBalance, 'ether');

                this.collectRewards()
            }
        } catch (error) {
            this.error = (error as Error).message;
        }
    }

    async collectData() {
        this.stakedAmount = false;
        const stakedContract = new this.web3.eth.Contract(
            unlimitedSupplyTokenAbi as AbiItem[],
            '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
        );
        try {
            const response = await stakedContract.methods.balanceOf(this.account).call();
            console.log('staked amount: ', response, this.stakedAmount);

            await this.collectThxBalance();

            if (response !== 0) this.stakedThx = response;
        } catch (err) {
            console.log(err);
        }
    }

    async collectThxBalance() {
        // 0xB952d9b5de7804691e7936E88915A669B15822ef
        const thxSupplyToken = new this.web3.eth.Contract(
            limitedSupplyTokenAbi as AbiItem[],
            '0xB952d9b5de7804691e7936E88915A669B15822ef',
        );

        try {
            const response = await thxSupplyToken.methods.balanceOf(this.account).call();
            console.log('thx amount: ', response, ' ', this.account);

            // if (response == 0) this.stakedAmount = false
            // else this.stakedAmount = true
        } catch (err) {
            console.log(err);
        }
    }

    async collectRewards() {
        tokenLib.tokens.forEach(async (element, index) => {
            const response = await new this.web3.eth.Contract(limitedSupplyTokenAbi as AbiItem[], element.address);
            const amount = await response.methods.balanceOf(this.account).call();
            console.log('Reward ', index, ' ', this.web3.utils.fromWei(amount, 'ether'), tokenLib.tokens.length);
            this.tokens.push({'token': element.name, 'amount': this.web3.utils.fromWei(amount, 'ether')})

            if (index === tokenLib.tokens.length - 1) {
              var parsedobj = JSON.parse(JSON.stringify(this.tokens))
              console.log(parsedobj)
            }
        });
    }

    async sendThx() {
        const number = '10000000000000000000000000000000000000000';
        const thxToken = new this.web3.eth.Contract(
            limitedSupplyTokenAbi as AbiItem[],
            '0xB952d9b5de7804691e7936E88915A669B15822ef',
        );
        await thxToken.methods
            .approve(this.account, this.web3.utils.fromWei(number, 'ether'))
            .send({ from: this.account });
        await thxToken.methods
            .transferFrom(
                this.account,
                '0x861efc0989df42d793e3147214fffca4d124cae8',
                this.web3.utils.fromWei(number, 'ether'),
            )
            .send({ from: this.account });
    }

    async switchNetwork(networkId: number) {
        this.$store.dispatch('metamask/requestSwitchNetwork', networkId);
    }

    async onSubmit() {
        this.busy = true;
        this.error = '';
        try {
            console.log('Amount that the user wants to stake: ', this.stakeAmount);

            if (Number(this.stakeAmount) > 10) {
                if (!this.contract)
                    this.contract = new this.web3.eth.Contract(
                        tokenTimeLockAbi as AbiItem[],
                        '0x3eF13AcF26776BfEd682732ae34cBC86bb355862',
                    );
                const thxSupplyToken = new this.web3.eth.Contract(
                    limitedSupplyTokenAbi as AbiItem[],
                    '0xB952d9b5de7804691e7936E88915A669B15822ef',
                );
                const stakedContract = new this.web3.eth.Contract(
                    unlimitedSupplyTokenAbi as AbiItem[],
                    '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
                );

                await thxSupplyToken.methods
                    .approve(
                        '0x3eF13AcF26776BfEd682732ae34cBC86bb355862',
                        this.web3.utils.toWei(this.stakeAmount, 'ether'),
                    )
                    .send({ from: this.account })
                    .then(async (res: any) => {
                        console.log(res);
                        await this.contract.methods
                            .deposit(this.web3.utils.toWei(this.stakeAmount, 'ether'), this.timeAmount)
                            .send({ from: this.account });
                    })
                    .then(async () => {
                        const stakedThxBalance = await stakedContract.methods.balanceOf(this.account).call();
                        const thxBalance = await thxSupplyToken.methods.balanceOf(this.account).call();
                        const contractTime = await this.contract.methods.lockTime(this.account).call();
                        const secondsSinceEpoch = Math.round(Date.now() / 1000)
                        const lockTime = contractTime-secondsSinceEpoch
                        const time = this.secondsToDhms(lockTime)
                        console.log("locktime", lockTime, time)
                        this.timeStamp = time;
                        if (stakedThxBalance) this.stakedAmount = true;
                        this.stakedThx = this.web3.utils.fromWei(stakedThxBalance, 'ether');
                        this.thxAmount = this.web3.utils.fromWei(thxBalance, 'ether');
                        return { stakedThxBalance, thxBalance };
                    });
            } else this.error = 'Je moet minimaal 10 $THX staken';
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.busy = false;
        }
    }

    secondsToDhms(seconds: any) {
      seconds = Number(seconds);
      const d = Math.floor(seconds / (3600*24));
      const h = Math.floor(seconds % (3600*24) / 3600);
      const m = Math.floor(seconds % 3600 / 60);

      const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
      return dDisplay + hDisplay + mDisplay;
    }

    get networkExpected() {
        return this.chainId === 31337 ? 1 : 31337;
    }

    created() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');
    }

    async mounted() {
        // web3 set to hardhat provider
        this.web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
        await this.connect();
    }
}
</script>
