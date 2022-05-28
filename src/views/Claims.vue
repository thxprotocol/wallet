<template>
    <div>
        <b-container>
            <div class="alert-danger">
                {{ error }}
            </div>

            <b-row class="mb-4">
                <b-col>{{ isConnected ? 'You are connected with wallet: ' + account : 'Not connected' }}</b-col>
                <b-col>
                    <b-button :hidden="isConnected" class="float-right" @click="connect">Connect metamask</b-button>
                </b-col>
            </b-row>

            <b-spinner v-if="loading" label="Spinning"></b-spinner>
            <template v-if="isConnected && !loading">
                <b-row class="mb-4" :hidden="walletExist">
                    <b-col> {{ "You haven't signed up for the pilot" }}</b-col>
                    <b-col>
                        <b-button class="float-right" @click="insertWallet">Sign up for the pilot</b-button>
                    </b-col>
                </b-row>

                <b-row class="mb-4" v-if="tokenAndAmount.length > 0">
                    <b-col>
                        {{
                            tokenAndAmount.length === 1
                                ? `You have one reward to claim`
                                : `You have ${tokenAndAmount.length} rewards to claim`
                        }}
                    </b-col>
                    <b-col>
                        <b-button :hidden="tokenAndAmount.length <= 1" class="float-right" @click="payAllRewards"
                            >Claim all tokens
                        </b-button>
                    </b-col>
                </b-row>

                <b-row class="mb-4" v-else>
                    <b-col>{{ 'You have no rewards to claim' }}</b-col>
                </b-row>
                <b-row class="mb-4" :key="key" v-for="(item, key) in tokenAndAmount">
                    <b-col>
                        {{ 'Token: ' + item.token }} <br />
                        {{ 'Amount:' + item.amount }}
                    </b-col>
                    <b-col>
                        <b-button class="float-right" @click="payOneReward(item.address)">
                            {{ 'Claim ' + item.token }}
                        </b-button>
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
import { default as feeCollectorAbi } from '../abis/FeeCollector.json';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { FEE_COLLECTOR_ADDRESS, VUE_APP_API_URL } from '@/utils/secrets';
import axios, { AxiosError } from 'axios';

@Component({
    computed: { ...mapState('metamask', ['account', 'chainId']), ...mapGetters('metamask', ['isConnected']) },
})
export default class Claims extends Vue {
    account!: string;
    web3!: Web3;
    contract!: Contract;
    tokenAndAmount: Token[] = [];
    error = '';
    walletExist = false;
    loading = false;

    /**
     * Connects user to metamask, after that the reward variable is updated
     */
    async connect() {
        // set address of smart-contract, found in modules-solidity after command npx hardhat node
        await this.$store.dispatch('metamask/connect');
        this.contract = new this.web3.eth.Contract(feeCollectorAbi as AbiItem[], FEE_COLLECTOR_ADDRESS);
        await this.init();
    }

    async init() {
        // when connected through metamask update reward variable
        await axios
            .get(`${VUE_APP_API_URL}/claims/${this.account}`)
            .then(response => {
                this.walletExist = response?.data;
            })
            .catch(this.handleError);

        if (this.walletExist) await this.updateReward();
    }

    /**
     * Update the reward variable and get all unique tokens with their amount and stores it in the tokenAndAmount Object array
     */
    async updateReward() {
        this.loading = true;
        let _amount!: any;
        let _address!: any;
        this.tokenAndAmount = [];

        try {
            this.error = '';
            const response = await this.contract.methods.getRewards(this.account).call();
            // loop to set all unique tokens to the tokenAndAmount-array with their address and amount
            for (let i = 0; i < response.length; i++) {
                // cast to Number, because response returns hexadecimal
                _amount = this.web3.utils.fromWei(response[i].amount);
                _address = response[i].token;
                // add all unique tokens to the tokenAndAmount-array including the amount of that specific token
                this.tokenAndAmount.push({ token: '', address: _address, amount: _amount });
            }
            await this.replaceToken();
        } catch (err) {
            await this.handleError(undefined, err as Error);
        }

        this.loading = false;
    }

    async payAllRewards() {
        await this.contract.methods
            .withdrawBulk()
            .send({
                from: this.account,
            })
            .then(this.init);
    }

    /**
     * Transfers the reward of one token
     * @param {string} address - The address of the token
     */
    async payOneReward(address: string) {
        await this.contract.methods
            .withdraw(address)
            .send({
                from: this.account,
            })
            .then(this.init);
    }

    async insertWallet() {
        await axios
            .post(`${VUE_APP_API_URL}/claims/wallet`, {
                wallet: this.account,
            })
            .then(this.init)
            .catch(this.handleError);
    }

    mounted() {
        // web3 set to hardhat provider
        this.web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
        this.connect();
    }

    private async replaceToken() {
        // Retrieve all addresses from db
        await axios
            .get(`${VUE_APP_API_URL}/tokens/token`)
            .then(allTokens => {
                // Loop trough the rewards
                for (const entry of this.tokenAndAmount) {
                    // Replace the address with token type retrieved earlier from db
                    const tokenType = allTokens?.data.find(
                        (address: { _id: string }) =>
                            address._id.toLocaleLowerCase() === entry.token.toLocaleLowerCase(),
                    );
                    entry.address = entry.token;
                    entry.token = tokenType.type;
                }
            })
            .catch(this.handleError);
    }

    /**
     * Basic error handler for any scenario to display the provided error message.
     *
     * @param e thrown error in the catch
     * @param err testing
     */
    private async handleError(e?: AxiosError, err?: Error) {
        this.error = e?.response?.data.message || err?.message;
        console.error('Something went wrong... Stacktrace: ');
        if (!e) console.trace('1: \n', e);
        if (!err) console.trace('2: \n', err);
    }
}

interface Token {
    token: string;
    address: string;
    amount: number;
}
</script>
