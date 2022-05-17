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
                <p v-if="error">Something went wrong!</p>
                <b-row class="mb-4" v-if="reward > 0">
                    <b-col>{{ 'You have ' + tokenAndAmount.length + ' token(s) to claim' }}</b-col>
                    <b-col>
                        <b-button class="float-right" @click="payAllRewards">Claim all tokens</b-button>
                    </b-col>
                </b-row>

                <b-row class="mb-4" v-else>
                    <b-col>{{ 'You have no tokens to claim' }}</b-col>
                </b-row>
                <b-row :key="key" v-for="(item, key) in tokenAndAmount">
                    <b-col>{{ item.token }}: {{ item.amount }}</b-col>
                    <b-col>
                        <b-button class="float-right" @click="payOneReward(item.token)">Claim token</b-button>
                    </b-col>
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

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    web3!: Web3;
    contract!: Contract;
    reward!: number;
    tokenAndAmount: Token[] = [];
    error = false;

    /**
     * Connects user to metamask, after that the reward variable is updated
     */
    async connect() {
        // set address of smart-contract, found in modules-solidity after command npx hardhat node
        const address = '0x5E0A87862f9175493Cc1d02199ad18Eff87Eb400';
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(ABI_THX as any, address);
        // when connected trough metamask update reward variable
        this.updateReward();
    }

    /**
     * Update the reward variable and get all unique tokens with their amount and stores it in the tokenAndAmount Object array
     */
    async updateReward() {
        const positionAddress = 0;
        const positionAmount = 2;
        let _amount!: any;
        this.reward = 0;
        this.tokenAndAmount = [];
        try {
            this.error = false;
            const response = await this.contract.methods.getRewards(this.account).call();
            // loop to set all unique tokens to the tokenAndAmount-array with their address and amount
            for (let i = 0; i < response.length; i++) {
                // cast to Number, because response returns hexadecimal
                _amount = Number(response[i][positionAmount]._hex.toString());
                this.reward += _amount;
                // add all unique tokens to the tokenAndAmount-array including the amount of that specific token
                this.tokenAndAmount.push({ token: response[i][positionAddress].toString(), amount: _amount });
            }
        } catch (err) {
            this.error = true;
            console.error('Error: ' + err);
        }
    }

    async payAllRewards() {
        await this.contract.methods.withdrawBulk().send({
            from: this.account,
        });
    }

    /**
     * Transfers the reward of one token
     * @param {string} address - The address of the token
     */
    async payOneReward(address: string) {
        await this.contract.methods.withdraw(address).send({
            from: this.account,
        });
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
