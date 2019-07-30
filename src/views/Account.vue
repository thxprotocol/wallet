<template>
<article class="region region--container">
    <main class="region region--content">

        <h2>Hi {{account.email}}!</h2>
        <p><strong>E-mail:</strong><br> {{account.email}}</p>
        <p><strong>UID:</strong><br> {{account.uid}}</p>
        <p><strong>Main Network Address:</strong><br> {{account.ethAddress}}</p>
        <p><strong>Loom Address:</strong><br> {{account.loomAddress}}</p>

        <h3>Main Network actions</h3>
        <ul class="list-bullets">
            <li><button class="btn btn-link" @click="showConnectKeysModal = true">Connect Accounts</button></li>
            <li v-if="account.ethAddress"><button class="btn btn-link" @click="showDepositToGatewayModal = true">Deposit THX to Gateway</button></li>
            <li v-if="account.ethAddress && isMinter"><button class="btn btn-link" @click="showAddMinterModal = true">Add minter role</button></li>
            <li v-if="account.ethAddress && isMinter"><button class="btn btn-link" @click="showMintTokensModal = true">Mint tokens</button></li>
        </ul>

        <template v-if="account.loomAddress">
            <h3>Loom Network actions</h3>
            <p>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></p>
            <ul class="list-bullets">
                <li><button class="btn btn-link" @click="showTransferTokensModal = true">Transfer tokens</button></li>
                <li><button class="btn btn-link" @click="showTransferToPoolModal = true">Pool deposit</button></li>
                <li v-if="isManager"><button class="btn btn-link" @click="showAddManagerModal = true">Add manager role</button></li>
            </ul>
        </template>

        <button @click="reset()" class="btn btn--default">Reset</button>
        <button @click="logout()" class="btn btn--default">Logout user</button>

        <modal v-if="showConnectKeysModal" @close="showConnectKeysModal = false">
            <h3 slot="header">Add private keys for accounts:</h3>
            <div slot="body">
                <input v-model="account.loomPrivateKey" type="text" placeholder="Your Loom private key">
                <input v-model="account.ethPrivateKey" type="text" placeholder="Your Ethereum private key">
            </div>
            <template slot="footer">
                <button @click="onCreateAccountsFromPrivateKey()" class="btn btn--success" >Connect</button>
            </template>
        </modal>

        <modal v-if="showAddMinterModal" @close="showAddMinterModal = false">
            <h3 slot="header">Add minter role to account:</h3>
            <div slot="body">
                <input v-if="!newMinterBusy" v-model="newMinterAddress" type="text" placeholder="0x0000000000000000000000000000000000000000">
                <span v-if="newMinterBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onAddMinter()" v-bind:class="{ disabled: newMinterBusy }" class="btn btn--success">Add minter</button>
            </template>
        </modal>

        <modal v-if="showMintTokensModal" @close="showMintTokensModal = false">
            <h3 slot="header">Mint tokens for account:</h3>
            <div slot="body">
                <input v-if="!mintForAccountBusy" v-model="mintForAccountAmount" type="number" min="0" />
                <span v-if="mintForAccountBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onMintForAccount()" v-bind:class="{ disabled: mintForAccountBusy }" class="btn btn--success" type="submit">Mint {{ mintForAccountAmount }} THX</button>
            </template>
        </modal>

        <modal v-if="showDepositToGatewayModal" @close="showDepositToGatewayModal = false">
            <h3 slot="header">Deposit to main network gateway:</h3>
            <div slot="body">
                <input v-if="!depositToGatewayBusy" v-model="depositToGatewayAmount" type="number" min="0" />
                <span v-if="depositToGatewayBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onDepositToGateway()" v-bind:class="{ disabled: depositToGatewayBusy }" class="btn btn--success">Deposit {{ depositToGatewayAmount }} THX</button>
            </template>
        </modal>

        <modal v-if="showTransferTokensModal" @close="showTransferTokensModal = false">
            <h3 slot="header">Transfer tokens to account:</h3>
            <div slot="body">
                <template v-if="!transferTokensBusy">
                    <input v-model="transferTokensAddress" type="text" placeholder="0x0000000000000000000000000000000000000000" />
                    <input v-model="transferTokensAmount" type="number" v-bind:max="balance.token" />
                </template>
                <span v-if="transferTokensBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onTransferTokens()" v-bind:class="{ disabled: transferTokensBusy }" class="btn btn--success">Transfer {{ transferTokensAmount }} THX</button>
            </template>
        </modal>

        <modal v-if="showTransferToPoolModal" @close="showTransferToPoolModal = false">
            <h3 slot="header">Reward pool deposit:</h3>
            <div slot="body">
                <p>Reward Pool balance: <strong>{{this.balance.pool}} THX</strong></p>
                <input v-if="!poolDepositBusy" v-model="transferToPoolAmount" type="number" v-bind:max="balance.token" />
                <span v-if="poolDepositBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onTransferToPool()" v-bind:class="{ disabled: poolDepositBusy }" class="btn btn--success">Deposit {{ transferTokensAmount }} THX</button>
            </template>
        </modal>

        <modal v-if="showAddManagerModal" @close="showAddManagerModal = false">
            <h3 slot="header">Add manager role for account:</h3>
            <div slot="body">
                <input v-if="!addManagerBusy" v-model="newManagerAddress" type="text" placeholder="0x0000000000000000000000000000000000000000">
                <span v-if="addManagerBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onAddManager()" v-bind:class="{ disabled: addManagerBusy }" class="btn btn--success">Add role</button>
            </template>
        </modal>
    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import EventService from '../services/EventService.js';
import StateService from '../services/StateService.js';

import modal from '../components/Modal';

const THX = window.THX;
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'home',
    components: {
        modal
    },
    data: function() {
        return {
            ea: new EventService(),
            state: new StateService(),
            isManager: false,
            isMinter: false,
            balance: {
                token: 0,
                pool: 0
            },
            showMintTokensModal: false,
            showAddMinterModal: false,
            showDepositToGatewayModal: false,
            showConnectKeysModal: false,
            showTransferTokensModal: false,
            showTransferToPoolModal: false,
            showAddManagerModal: false,
            transferToPoolAmount: 0,
            mintForAccountAmount: 0,
            newManagerAddress: "",
            newMinterAddress: "",
            transferTokensAddress: "",
            transferTokensAmount: 0,
            transferEtherAddress: "",
            transferEtherAmount: 0,
            depositToGatewayAmount: 0,
            depositToGatewayBusy: false,
            account: {
                uid: null,
                email: null,
                loomAddress: null,
                ethAddress: null,
                loomPrivateKey: null,
                ethPrivateKey: null,
            },
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
            let tokenRinkeby, token, pool, balanceInWei;

            await THX.contracts.load(loomKey, ethKey);

            tokenRinkeby = THX.contracts.instances.tokenRinkeby;
            token = THX.contracts.instances.token;
            pool = THX.contracts.instances.pool;

            this.account.loomAddress = THX.contracts.loomAddress;
            this.account.ethAddress = THX.contracts.ethAddress;
            this.account.loomPrivateKey = loomKey;
            this.account.ethPrivateKey = ethKey;

            firebase.database().ref('wallets').child(this.account.loomAddress).child('uid').set(uid);

            balanceInWei = await token.methods.balanceOf(pool._address).call();
            this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

            balanceInWei = await token.methods.balanceOf(this.account.loomAddress).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

            balanceInWei = await tokenRinkeby.methods.balanceOf(this.account.ethAddress).call();
            this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);

            this.isManager = await pool.methods.isManager(this.account.loomAddress).call();
            this.isMinter = await tokenRinkeby.methods.isMinter(this.account.ethAddress).call();

            this.$parent.$refs.header.updateBalance();
        },
        logout() {
            this.$router.push('/logout');
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
        onDepositToGateway() {
            this.depositToGatewayBusy = true;
            THX.contracts.depositToRinkebyGateway(this.depositToGatewayAmount).then(() => {
                this.depositToGatewayAmount = 0;
                this.depositToGatewayBusy = false;
            });
        },
        onTransferTokens() {
            const token = THX.contracts.instances.token;
            const tokenAmount = new BN(this.transferTokensAmount).mul(tokenMultiplier);

            return token.methods.transfer(this.transferTokensAddress, tokenAmount.toString()).send({ from: this.account.loomAddress }).then(async () => {
                const pool = THX.contracts.instances.pool;
                let balanceInWei;

                balanceInWei = await token.methods.balanceOf(pool._address).call();
                this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

                balanceInWei = await token.methods.balanceOf(this.account.loomAddress).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.transferTokensAmount = 0;
            });
        },
        onMintForAccount() {
            THX.contracts.mint(this.account.ethAddress, this.mintForAccountAmount);
        },
        onTransferToPool() {
            const pool = THX.contracts.instances.pool;
            const tokenAmount = new BN(this.transferToPoolAmount).mul(tokenMultiplier);

            return pool.methods.deposit(tokenAmount.toString()).send({ from: this.account.loomAddress }).then(async () => {
                let balanceInWei;
                const token = THX.contracts.instances.token;

                balanceInWei = await token.methods.balanceOf(pool._address).call();
                this.balance.pool = new BN(balanceInWei).div(tokenMultiplier);

                balanceInWei = await token.methods.balanceOf(this.account.loomAddress).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.transferToPoolAmount = 0;
            });
        },
        onAddManager() {
            const pool = THX.contracts.instances.pool;

            return pool.methods.addManager(this.newManagerAddress).send({ from: this.account.loomAddress }).then(async () => {

            });
        },
        onAddMinter() {
            const token = THX.contracts.instances.token;

            return token.methods.addMinter(this.newMinterAddress).send({ from: this.account.loomAddress }).then(async () => {

            });
        }
    }
}
</script>
