<template>
<article class="region region--container">
    <main class="region region--content">
        <a href="/#/logout">Logout user</a>
        <h3>Your details:</h3>

        <p><small>{{account.email}}</small><br/>
        <small>{{account.uid}}</small><br/>
        <small>{{account.address}}</small></p>

        <h3>Submit private key:</h3>
        <form v-on:submit="onCreateAccountFromPrivateKey()">
            <input v-model="account.privateKey" type="text" placeholder="Your private key">
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
            tx: null,
            privateKey: null,
            account: {
                uid: null,
                email: null,
                address: null,
                privateKey: null,
            },
            state: new StateService(),
            ea: new EventService(),
        }
    },
    created() {

    },
    mounted() {
        const uid = firebase.auth().currentUser.uid;
        const key = (typeof this.state.getItem('privateKey') !== "undefined") ? this.state.getItem('privateKey') : null;

        this.init(uid, key);

        firebase.database().ref('users').child(uid).once('value').then((s) => {
            this.account.uid = s.val().uid;
            this.account.email = s.val().email;
        });
    },
    methods: {
        async init(uid, key) {
            let token, pool;

            await THX.contracts.load(key);

            token = THX.contracts.instances.token;
            pool = THX.contracts.instances.pool;

            this.account.address = THX.contracts.currentUserAddress;
            this.account.privateKey = key;

            firebase.database().ref('wallets').child(this.account.address).child('uid').set(uid);

            this.balance.token = await token.methods.balanceOf(this.account.address).call();
            this.balance.pool = await token.methods.balanceOf(pool._address).call();
            this.isManager = await pool.methods.isManager(this.account.address).call();
            this.isMinter = await token.methods.isMinter(this.account.address).call();

            this.$parent.$refs.header.updateBalance();
        },
        reset() {
            this.account.privateKey = null;
            this.state.clear();

            window.location.reload();
        },
        onCreateAccountFromPrivateKey() {
            const uid = firebase.auth().currentUser.uid;

            this.state.setItem('privateKey', this.account.privateKey);
            this.init(uid, this.account.privateKey);

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
            const token = THX.contracts.instances.token;
            const pool = THX.contracts.instances.pool;

            return token.methods.mint(this.account.address, this.mintForAccountAmount).send({ from: this.account.address }).then(async () => {
                this.balance.pool = await token.methods.balanceOf(pool._address).call();
                this.balance.token = await token.methods.balanceOf(this.account.address).call();

                this.$parent.$refs.header.updateBalance();
            });

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
