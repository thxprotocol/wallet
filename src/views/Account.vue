<template>
<article class="region region--container">
    <main class="region region--content">

        <h2>Account</h2>
        <label class="upload-group">
            <div v-if="!account.picture">
                <label>
                    <ProfilePicture size="lg" :uid="uid"></ProfilePicture>
                    <input type="file" @change="onFileChange" class="invisible">
                </label>
            </div>
            <div v-else>
                <ProfilePicture size="lg" :uid="uid"></ProfilePicture>
                <button class="btn btn-link" @click="removeImage">Delete</button>
            </div>
        </label>

        <p>
            <strong>E-mail:</strong><br> {{account.email}}
        </p>
        <p>
            <strong>UID:</strong><br> {{account.uid}}
        </p>
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

        <h3>Auth actions</h3>
        <ul class="list list-bullets">
            <li>
                <button @click="reset()" class="btn btn-link">Reset</button>
            </li>
            <li>
                <button @click="logout()" class="btn btn-link">Logout user</button>
            </li>
        </ul>

        <Modal v-if="showConnectKeysModal" @close="showConnectKeysModal = false">
            <h3 slot="header">Add private keys for accounts:</h3>
            <div slot="body">
                <div class="form-group">
                    <label>Loom private key:</label>
                    <input v-model="input.loomPrivateKey" type="text" class="form-control" placeholder="Your Loom private key">
                </div>
                <div class="form-group">
                    <label>Rinkeby private key:</label>
                    <input v-model="input.rinkebyPrivateKey" type="text" class="form-control" placeholder="Your Rinkeby private key">
                </div>
            </div>
            <template slot="footer">
                <button @click="onCreateAccountsFromPrivateKey()" class="btn btn-primary" >Connect</button>
            </template>
        </Modal>

        <Modal v-if="showAddMinterModal" @close="showAddMinterModal = false">
            <h3 slot="header">Add minter role to account:</h3>
            <div slot="body" v-if="!loading">
                <input v-model="newMinterAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">>
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="onAddMinter()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add minter</button>
            </template>
        </Modal>

        <Modal v-if="showMintTokensModal" @close="showMintTokensModal = false">
            <h3 slot="header">Mint tokens for account:</h3>
            <div slot="body" v-if="!loading" >
                <input v-model="mintForAccountAmount" type="number" class="form-control"  min="0" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="onMintForAccount()" v-bind:class="{ disabled: loading }" class="btn btn-primary" type="submit">Mint {{ mintForAccountAmount }} THX</button>
            </template>
        </Modal>

        <Modal v-if="showMintLoomTokensModal" @close="showMintLoomTokensModal = false">
            <h3 slot="header">Mint tokens for Loom account:</h3>
            <div slot="body" v-if="!loading" >
                <input v-if="!loading" v-model="mintForLoomAccountAmount" type="number" class="form-control"  min="0" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="onMintForLoomAccount()" v-bind:class="{ disabled: loading }" class="btn btn-primary" type="submit">Mint {{ mintForLoomAccountAmount }} THX</button>
            </template>
        </Modal>

        <Modal v-if="showDepositToGatewayModal" @close="showDepositToGatewayModal = false">
            <h3 slot="header">Deposit to main network gateway:</h3>
            <div slot="body" v-if="!loading">
                <input v-if="!loading" v-model="depositToGatewayAmount" type="number" class="form-control"  min="0" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="onDepositToGateway()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Deposit {{ depositToGatewayAmount }} THX</button>
            </template>
        </Modal>

        <Modal v-if="showTransferTokensModal" @close="showTransferTokensModal = false">
            <h3 slot="header">Transfer tokens to account:</h3>
            <div slot="body" v-if="!loading">
                <input v-model="transferTokensAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                <input v-model="transferTokensAmount" type="number" class="form-control"  v-bind:max="balance.token" />
            </div>
            <div slot="body" v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </div>
            <template slot="footer">
                <button @click="onTransferTokens()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Transfer {{ transferTokensAmount }} THX</button>
            </template>
        </Modal>

    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { BSpinner } from 'bootstrap-vue';
import Modal from '../components/Modal';
import ProfilePicture from '../components/ProfilePicture';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'home',
    components: {
        Modal,
        BSpinner,
        ProfilePicture,
    },
    data: function() {
        return {
            uid: firebase.auth().currentUser.uid,
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
            depositToGatewayAmount: 0,
            loading: false,
            balance: {
                token: 0,
                pool: 0
            },
            input: {
                loomPrivateKey: '',
                rinkebyPrivateKey: '',
            },
            account: {
                uid: null,
                email: null,
                picture: null,
                firstName: '',
                lastName: '',
                loom: {
                    address: null,
                    privateKey: null,
                },
                rinkeby: {
                    address: null,
                    privateKey: null,
                }
            }
        }
    },
    created() {
        const uid = firebase.auth().currentUser.uid;

        firebase.database().ref(`users/${uid}`).once('value').then(async s => {
            const u = s.val();
            const picture = u.picture;

            if (picture) {
                this.account.picture = picture.url;
            }

            this.account.firstName = u.firstName;
            this.account.lastName = u.lastName;
            this.account.uid = u.uid;
            this.account.email = u.email;

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

            this.input.loomPrivateKey = THX.state.loomPrivateKey;
            this.input.rinkebyPrivateKey = THX.state.rinkebyPrivateKey;

            firebase.database().ref(`wallets/${this.account.loom.address.toLowerCase()}`).child('uid').set(uid);

            balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);
            this.isLoomMinter = await token.methods.isMinter(this.account.loom.address).call();

            balanceInWei = await tokenRinkeby.methods.balanceOf(this.account.rinkeby.address).call();
            this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
            this.isRinkebyMinter = await tokenRinkeby.methods.isMinter(this.account.rinkeby.address).call();

            this.$parent.$refs.header.updateBalance();
        },
        onFileChange(e) {
            const uid = firebase.auth().currentUser.uid;
            const avatarRef = firebase.storage().ref('avatars');
            const files = e.target.files || e.dataTransfer.files;
            const fileName = `${uid}.jpg`;

            avatarRef.child(fileName).put(files[0]).then(async s => {
                const url = await s.ref.getDownloadURL();

                this.account.picture = url;

                firebase.database().ref('users').child(uid).update({ picture: { name: fileName, url: url }});
            });
        },
        async removeImage() {
            const uid = firebase.auth().currentUser.uid;
            const avatarRef = firebase.storage().ref('avatars');
            const pictureRef = firebase.database().ref(`users/${uid}/picture`);
            const fileName = (await pictureRef.child('name').once('value')).val();

            avatarRef.child(fileName).delete().then(() => {
                pictureRef.remove().then(() => {
                    this.account.picture = null
                });
            });
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

            THX.state.loomPrivateKey = this.input.loomPrivateKey;
            THX.state.rinkebyPrivateKey = this.input.rinkebyPrivateKey;
            THX.state.save();

            alert('Your account is connected. The app will restart.');

            return window.location.reload();
        },
        onDepositToGateway() {
            const THX = window.THX;

            this.loading = true;

            return THX.network.depositToRinkebyGateway(this.depositToGatewayAmount)
                .then(() => {
                    this.depositToGatewayAmount = 0;
                    this.loading = false;
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

            return THX.network.mint(this.account.rinkeby.address, this.mintForAccountAmount)
                .then(() => {
                    this.depositToGatewayAmount = 0;
                    this.loading = false;
                });
        },
        onMintForLoomAccount() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const amount = new BN(this.mintForLoomAccountAmount).mul(tokenMultiplier);

            this.loading = true;

            return token.methods.mint(this.account.loom.address, amount.toString()).send({ from: this.account.loom.address}).then(async () => {
                const balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.mintForLoomAccountAmount = 0;
                this.loading = false;
            });
        },
        onAddMinter() {
            const THX = window.THX;
            const token = THX.network.instances.token;

            this.loading = true;

            return token.methods.addMinter(this.newMinterAddress).send({ from: this.account.loom.address }).then(async () => {
                this.loading = false;
            });
        }
    }
}
</script>
