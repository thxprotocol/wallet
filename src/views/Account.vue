<template>
<article class="region region--container">
    <main class="region region--content">
        <a href="/#/logout">Logout user</a>
        <h3>Your details:</h3>

        <p><small>{{account.email}}</small><br/>
        <small>{{account.uid}}</small><br/>
        <small>Loom: {{account.loomAddress}}</small><br/>
        <small>Eth: {{account.ethAddress}}</small></p>

        <h3>Submit private key:</h3>
        <form v-on:submit="onCreateAccountsFromPrivateKey()">
            <input v-model="account.loomPrivateKey" type="text" placeholder="Your Loom private key">
            <input v-model="account.ethPrivateKey" type="text" placeholder="Your Ethereum private key">
            <button class="btn btn--default" type="submit">Connect accounts</button>
        </form>

        <button v-on:click="reset()" class="btn btn--default">Reset</button>

        <template v-if="account.loomAddress">
            <h1>Eth account</h1>
            <div v-if="isMinter">
                <h3>Mint tokens:</h3>
                <form>
                    <input v-model="mintForAccountAmount" type="number" min="0" />
                    <button v-on:click="onMintForAccount()" class="btn btn--default" type="submit">Mint {{ mintForAccountAmount }} THX</button>
                </form>
            </div>

            <div v-if="isMinter">
                <h3>Add minter:</h3>
                <form v-on:submit="onAddMinter()">
                    <input v-model="newMinterAddress" type="text" placeholder="account_address">
                    <button class="btn btn--default" type="submit">Add minter</button>
                </form>
            </div>

            <h3>Transfer Ether:</h3>
            <form>
                <input v-model="transferEtherAddress" type="text" placeholder="account_address" />
                <input v-model="transferEtherAmount" type="number" min="0" />
                <button class="btn btn--default" v-on:click="onTransferEther()">Transfer {{ transferEtherAmount }} ETH</button>
            </form>
        </template>


        <h1>Loom Account</h1>
        <template v-if="account.loomAddress">
            <h3>Transfer Tokens:</h3>
            <form v-on:submit="onTransferTokens()">
                <input v-model="transferTokensAddress" type="text" placeholder="account_address" />
                <input v-model="transferTokensAmount" type="number" min="0" v-bind:max="balance.token" />
                <button class="btn btn--default" type="submit">Transfer {{ transferTokensAmount }} THX</button>
            </form>

            <h3>Pool deposit:</h3>
            <small>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></small>
            <form v-on:submit="onTransferToPool()">
                <input v-model="transferToPoolAmount" type="number" min="0" v-bind:max="balance.token" />
                <button class="btn btn--default" type="submit">Deposit {{ transferToPoolAmount }} THX</button>
            </form>

            <div v-if="isManager">
                <h3>Add manager:</h3>
                <form v-on:submit="onAddManager()">
                    <input v-model="newManagerAddress" type="text" placeholder="account_address">
                    <button class="btn btn--default" type="submit">Add manager</button>
                </form>
            </div>

        </template>

    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService.js';
import StateService from '../services/StateService.js';

const THX = window.THX;

export default {
    name: 'home',
    data: function() {
        return {
            network: null,
            isManager: false,
            isMinter: false,
            balance: {
                token: 0,
                pool: 0
            },
            transferToPoolAmount: 0,
            mintForAccountAmount: 0,
            rewardSlug: "",
            rewardAmount: 0,
            newManagerAddress: "",
            newMinterAddress: "",
            transferTokensAddress: "",
            transferTokensAmount: 0,
            transferEtherAddress: "",
            transferEtherAmount: 0,
            account: {
                uid: null,
                email: null,
                loomAddress: null,
                ethAddress: null,
                loomPrivateKey: null,
                ethPrivateKey: null,
            },
            state: new StateService(),
            ea: new EventService(),
        }
    },
    created() {

    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;
        const loomKey = (typeof this.state.getItem('loomPrivateKey') !== "undefined") ? this.state.getItem('loomPrivateKey') : null;
        const ethKey = (typeof this.state.getItem('ethPrivateKey') !== "undefined") ? this.state.getItem('ethPrivateKey') : null;

        if (loomKey && ethKey) this.init(uid, loomKey, ethKey);

        firebase.database().ref('users').child(uid).once('value').then((s) => {
            this.account.uid = s.val().uid;
            this.account.email = s.val().email;
        });
    },
    methods: {
        async init(uid, loomKey, ethKey) {
            let tokenRinkeby, token, pool;

            await THX.contracts.load(loomKey, ethKey);

            tokenRinkeby = THX.contracts.instances.tokenRinkeby;
            token = THX.contracts.instances.token;
            pool = THX.contracts.instances.pool;

            this.account.loomAddress = THX.contracts.loomAddress;
            this.account.ethAddress = THX.contracts.ethAddress;
            this.account.loomPrivateKey = loomKey;
            this.account.ethPrivateKey = ethKey;

            firebase.database().ref('wallets').child(this.account.loomAddress).child('uid').set(uid);

            this.balance.tokenRinkeby = await tokenRinkeby.methods.balanceOf(this.account.ethAddress).call();
            this.balance.token = await token.methods.balanceOf(this.account.loomAddress).call();
            this.balance.pool = await token.methods.balanceOf(pool._address).call();
            this.isManager = await pool.methods.isManager(this.account.loomAddress).call();

            this.isMinter = await tokenRinkeby.methods.isMinter(this.account.ethAddress).call();

            this.$parent.$refs.header.updateBalance();
        },
        reset() {
            this.account.loomPrivateKey = null;
            this.account.ethPrivateKey = null;
            this.state.clear();

            window.location.reload();
        },
        onCreateAccountsFromPrivateKey() {
            const uid = firebase.auth().currentUser.uid;

            this.state.setItem('loomPrivateKey', this.account.loomPrivateKey);
            this.state.setItem('ethPrivateKey', this.account.ethPrivateKey);
            this.init(uid, this.account.loomPrivateKey, this.account.ethPrivateKey);

            alert('Your account is connected.');
        },
        onTransferTokens() {
            const token = THX.contracts.instances.token;

            return token.methods.transfer(this.transferTokensAddress, this.transferTokensAmount).send({ from: this.account.address }).then(async () => {
                const pool = THX.contracts.instances.pool;

                this.balance.pool = await token.methods.balanceOf(pool._address).call();
                this.balance.token = await token.methods.balanceOf(this.account.address).call();

                this.$parent.$refs.header.updateBalance();
            });
        },
        onMintForAccount() {
            THX.contracts.mint(this.account.ethAddress, this.mintForAccountAmount);
        },
        onTransferToPool() {
            const pool = THX.contracts.instances.pool;

            return pool.methods.deposit(this.transferToPoolAmount).send({ from: this.account.address }).then(async () => {
                const token = THX.contracts.instances.token;

                this.balance.pool = await token.methods.balanceOf(pool._address).call();
                this.balance.token = await token.methods.balanceOf(this.account.address).call();

                this.$parent.$refs.header.updateBalance();
            });
        },
        onAddManager() {
            const pool = THX.contracts.instances.pool;

            return pool.methods.addManager(this.newManagerAddress).send({ from: this.account.address }).then(async () => {

            });
        },
        onAddMinter() {
            const token = THX.contracts.instances.token;

            return token.methods.addMinter(this.newMinterAddress).send({ from: this.account.address }).then(async () => {

            });
        }
    }
}
</script>
