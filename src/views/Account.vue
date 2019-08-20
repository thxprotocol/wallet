<template>
<article class="region region--container">
    <main class="region region--content">

        <h2>Hi {{account.email}}!</h2>
        <p><strong>E-mail:</strong><br> {{account.email}}</p>
        <p><strong>UID:</strong><br> {{account.uid}}</p>
        <p>
            <strong>Main Network Address:</strong><br>
            <span v-if="account.rinkeby.address">{{account.rinkeby.address}}</span>
        </p>
        <p>
            <strong>Loom Address:</strong><br>
            <span v-if="account.loom.address">{{account.loom.address}}</span>
        </p>

        <h3>Main Network actions</h3>
        <ul class="list-bullets">
            <li><button class="btn btn-link" @click="showConnectKeysModal = true">Connect Accounts</button></li>
            <li v-if="account.rinkeby.address"><button class="btn btn-link" @click="showDepositToGatewayModal = true">Deposit THX to Gateway</button></li>
            <li v-if="account.rinkeby.address"><button class="btn btn-link" @click="showDepositToGatewayModal = true">Withdraw THX from Gateway</button></li>
            <li v-if="account.rinkeby.address && isRinkebyMinter"><button class="btn btn-link" @click="showAddMinterModal = true">Add minter role</button></li>
            <li v-if="account.rinkeby.address && isRinkebyMinter"><button class="btn btn-link" @click="showMintTokensModal = true">Mint tokens</button></li>
        </ul>

        <template v-if="account.loom.address">
            <h3>Loom Network actions</h3>
            <ul class="list-bullets">
                <li v-if="isLoomMinter"><button class="btn btn-link" @click="showMintLoomTokensModal = true">Mint Loom tokens</button></li>
                <li><button class="btn btn-link" @click="showTransferTokensModal = true">Transfer tokens</button></li>
            </ul>
        </template>

        <button @click="reset()" class="btn btn--default">Reset</button>
        <button @click="logout()" class="btn btn--default">Logout user</button>

        <modal v-if="showConnectKeysModal" @close="showConnectKeysModal = false">
            <h3 slot="header">Add private keys for accounts:</h3>
            <div slot="body">
                <input v-model="account.loom.privateKey" type="text" placeholder="Your Loom private key">
                <input v-model="account.rinkeby.privateKey" type="text" placeholder="Your Rinkeby private key">
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

        <modal v-if="showMintLoomTokensModal" @close="showMintLoomTokensModal = false">
            <h3 slot="header">Mint tokens for Loom account:</h3>
            <div slot="body">
                <input v-if="!mintForLoomAccountBusy" v-model="mintForLoomAccountAmount" type="number" min="0" />
                <span v-if="mintForLoomAccountBusy" class="">Processing transaction...</span>
            </div>
            <template slot="footer">
                <button @click="onMintForLoomAccount()" v-bind:class="{ disabled: mintForLoomAccountBusy }" class="btn btn--success" type="submit">Mint {{ mintForLoomAccountAmount }} THX</button>
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

    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import TransferGateway from '../services/TransferGateway.js';

import modal from '../components/Modal';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'home',
    components: {
        modal
    },
    data: function() {
        return {
            isLoomMinter: false,
            isRinkebyMinter: false,
            showMintTokensModal: false,
            showDepositToGatewayModal: false,
            showConnectKeysModal: false,
            showTransferTokensModal: false,
            showMintLoomTokensModal: false,
            showAddMinterModal: false,
            mintForAccountAmount: 0,
            mintForLoomAccountAmount: 0,
            newMinterAddress: "",
            transferTokensAddress: "",
            transferTokensAmount: 0,
            transferTokensBusy: false,
            depositToGatewayAmount: 0,
            depositToGatewayBusy: false,
            mintForLoomAccountBusy: false,
            addMinterBusy: false,
            mintForAccountBusy: false,
            newMinterBusy: false,
            balance: {
                token: 0,
                pool: 0
            },
            account: {
                uid: null,
                email: null,
                loom: {
                    address: null,
                    privateKey: null,
                },
                rinkeby: {
                    address: null,
                    privateKey: null,
                },
            },
        }
    },
    created() {
        const uid = firebase.auth().currentUser.uid;

        firebase.database().ref(`users/${uid}`).once('value').then((s) => {
            this.account.uid = s.val().uid;
            this.account.email = s.val().email;

            this.init(uid);
        });
    },
    mounted() {

    },
    methods: {
        async init(uid) {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const tokenRinkeby = THX.network.instances.tokenRinkeby;
            let balanceInWei

            this.account.loom = THX.network.account;
            this.account.rinkeby = THX.network.rinkeby.account;

            firebase.database().ref(`wallets/${this.account.loom.address}`).child('uid').set(uid);

            balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);
            this.isLoomMinter = await token.methods.isMinter(this.account.loom.address).call();


            balanceInWei = await tokenRinkeby.methods.balanceOf(this.account.rinkeby.address).call();
            this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
            this.isRinkebyMinter = await tokenRinkeby.methods.isMinter(this.account.rinkeby.address).call();

            this.$parent.$refs.header.updateBalance();
        },
        logout() {
            this.$router.push('/logout');
        },
        reset() {
            const THX = window.THX;

            THX.state.clear();

            return window.location.reload();
        },
        onCreateAccountsFromPrivateKey() {
            const THX = window.THX;

            THX.state.loomPrivateKey = this.account.loom.privateKey;
            THX.state.rinkebyPrivateKey = this.account.rinkeby.privateKey;
            THX.state.save();

            alert('Your account is connected. The app will restart.');

            return window.location.reload();
        },
        onDepositToGateway() {
            this.depositToGatewayBusy = true;

            TransferGateway.depositToRinkebyGateway(this.depositToGatewayAmount).then(() => {
                this.depositToGatewayAmount = 0;
                this.depositToGatewayBusy = false;
            });
        },
        onTransferTokens() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const amount = new BN(this.transferTokensAmount).mul(tokenMultiplier);

            return token.methods.transfer(this.transferTokensAddress, amount.toString()).send({ from: this.account.loom.address }).then(async () => {
                let balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.transferTokensAmount = 0;
            });
        },
        onMintForAccount() {
            const THX = window.THX;
            const tokenRinkeby = THX.network.instances.tokenRinkeby;

            return tokenRinkeby.mint(this.account.rinkeby.address, this.mintForAccountAmount);
        },
        onMintForLoomAccount() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const amount = new BN(this.mintForLoomAccountAmount).mul(tokenMultiplier);

            this.mintForLoomAccountBusy = true;

            return token.methods.mint(this.account.loom.address, amount.toString()).send({ from: this.account.loom.address}).then(async () => {
                const balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.mintForLoomAccountAmount = 0;
                this.mintForLoomAccountBusy = false;
            });
        },
        onAddMinter() {
            const THX = window.THX;
            const token = THX.network.instances.token;

            this.addMinterBusy = true;

            return token.methods.addMinter(this.newMinterAddress).send({ from: this.account.loom.address }).then(async () => {
                this.addMinterBusy = false;
            });
        }
    }
}
</script>
