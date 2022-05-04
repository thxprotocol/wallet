<template>
    <div>
        <b-container>
            <b-row class="mb-4">
                <b-col>{{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected' }}</b-col>
                <b-col>
                    <b-button class="float-right" @click="connect" :hidden="isConnected">Connect metamask</b-button>
                </b-col>
            </b-row>

            <template v-if="isConnected">
                <b-row class="mb-4" v-if="reward > 0">
                    <b-col>{{ 'You have ' + tokenAndAmount.length + ' token(s) to claim' }}</b-col>
                    <b-col>
                        <b-button class="float-right" @click="payAllRewards">Claim all tokens</b-button>
                    </b-col>
                </b-row>

                <b-row class="mb-4" v-else>
                    <b-col>{{ 'You have no tokens to claim' }}</b-col>
                </b-row>

            </template>
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
    tokenAndAmount: Token[] = [];


    async connect() {
        const address = '0x5E0A87862f9175493Cc1d02199ad18Eff87Eb400';
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(ABI_THX as any, address);
        this.updateReward();
    }

    async updateReward() {
        const positionAddress = 0;
        const positonAmount = 2;
        let _amount!: any;
        let token!: any;
        this.reward = 0;
        try {
            const response = await this.contract.methods.getRewards().call();
            for (let i = 0; i < response.length; i++) {
                _amount = Number(response[i][positonAmount]._hex.toString());
                this.reward += _amount;
              console.log(response[i][positionAddress].toString())
              console.log(_amount)
                this.tokenAndAmount.push({ token: response[i][positionAddress].toString(), amount: _amount });
            }
        } catch (err) {
            console.log('Error: ' + err);
        }
    }

    async payAllRewards() {
        await this.contract.methods.withdraw().call();
    }

    async payOneReward() {
        await this.contract.methods.withdrawBulk().call();
    }

    mounted() {
        // web3 set to hardhat provider
        this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        this.updateReward();
    }


}

interface Token {
  token: string;
  amount: number;
}

</script>
