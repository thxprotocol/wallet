<template>
<article class="region region--container">
    <Header ref="header" />
    <main class="region region--content">

        <h3>Your details:</h3>
        <p><small>{{account.email}}</small><br/>
        <small>{{account.uid}}</small><br/>
        <small>{{account.address}}</small></p>

        <h3>Submit private key:</h3>
        <form v-on:submit="onCreateAccountFromPrivateKey()">
            <input v-model="privateKey" type="text" placeholder="0x023659u23etc">
            <button class="btn btn--default" type="submit">Connect account</button>
        </form>

        <button v-on:click="reset()" class="btn btn--default">Reset</button>

        <template v-if="account.address">
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

            <div v-if="isMinter">
                <h3>Mint tokens:</h3>
                <form v-on:submit="onMintForAccount()">
                    <input v-model="mintForAccountAmount" type="number" min="0" />
                    <button class="btn btn--default" type="submit">Mint {{ mintForAccountAmount }} THX</button>
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

    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService.js';
import Header from '../components/Header.vue'

const THX = window.THX;

export default {
    name: 'home',
    components: {
        Header
    },
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
            tx: null,
            privateKey: (typeof localStorage.privateKey != "undefined") ? localStorage.privateKey : null,
            account: {
                uid: null,
                email: null,
                address: null,
                privateKey: null,
            },
            ea: new EventService(),
        }
    },
    created() {
        const uid = firebase.auth().currentUser.uid;

        THX.ns.connect().then(() => this.init()).catch(() => console.error);

        firebase.database().ref('users').child(uid).once('value').then((s) => {
            this.account.uid = s.val().uid;
            this.account.email = s.val().email;
        });
    },
    methods: {
        async init() {
            const token = THX.ns.instances.token
            const pool = THX.ns.instances.pool;

            this.account.address = THX.ns.account.address;
            this.account.privateKey = THX.ns.account.privateKey;

            this.balance.token = await token.methods.balanceOf(THX.ns.accounts[0]).call()
            this.balance.pool = await token.methods.balanceOf(pool.address).call()
            this.isManager = await pool.methods.isManager(THX.ns.accounts[0]).call()
            this.isMinter = await token.methods.isMinter(THX.ns.accounts[0]).call()
        },
        reset() {
            this.privateKey = null;
            localStorage.setItem('privateKey', "");
            window.location.reload();
        },
        async onCreateAccountFromPrivateKey() {
            THX.ns.privateKeyToAccount(this.privateKey);
            this.init();
            alert('Your account is created!');
        },
        async onTransferEther() {
            const signedTx = await THX.ns.signTransaction(this.transferEtherAddress, this.transferEtherAmount);
            await THX.ns.sendSignedTransaction(signedTx);

            return this.$refs.header.updateBalance();
        },
        async onTransferTokens() {
            const token = THX.ns.instances.token;
            const data = token.methods.transfer(this.transferTokensAddress, this.transferTokensAmount).encodeABI();
            const rawTx = await THX.ns.signContractMethod(token.address, data);
            THX.ns.sendSignedTransaction(rawTx);

            this.$refs.header.updateBalance();

            this.$router.replace('/');
        },
        async onMintForAccount() {
            const token = THX.ns.instances.token;
            const data = token.methods.mint(THX.ns.accounts[0], this.mintForAccountAmount).encodeABI();
            const rawTx = await THX.ns.signContractMethod(token.address, data);

            await THX.ns.sendSignedTransaction(rawTx);

            this.balance.pool = await token.methods.balanceOf(THX.ns.addresses.pool).call();
            this.balance.token = await token.methods.balanceOf(THX.ns.accounts[0]).call();

            return this.$refs.header.updateBalance()
        },
        async onTransferToPool() {
            const pool = THX.ns.instances.pool;
            const data = pool.methods.deposit(this.transferToPoolAmount).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            await THX.ns.sendSignedTransaction(rawTx);

            return this.$refs.header.updateBalance();
        },
        async onAddManager() {
            const pool = THX.ns.instances.pool;
            const data = pool.methods.addManager(this.newManagerAddress).encodeABI();
            const rawTx = await THX.ns.signContractMethod(pool.address, data);

            return await THX.ns.sendSignedTransaction(rawTx);
        },
        async onAddMinter() {
            const token = THX.ns.instances.token;
            const data = token.methods.addMinter(this.newMinterAddress).encodeABI();
            const rawTx = await THX.ns.signContractMethod(token.address, data);

            return await THX.ns.sendSignedTransaction(rawTx);
        }
    }
}
</script>
