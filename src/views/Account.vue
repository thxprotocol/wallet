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
            <strong>Rinkeby Address:</strong><br>
            <span v-if="account.rinkeby.address">{{account.rinkeby.address}}</span>
        </p>
        <p>
            <strong>Loom Address:</strong><br>
            <span v-if="account.loom.address">{{account.loom.address}}</span>
        </p>

        <h3>Main Network actions</h3>
        <ul class="list-bullets">
            <li><button class="btn btn-link" @click="showModal('modal-connect')">Connect Accounts</button></li>
            <li v-if="account.rinkeby.address"><button class="btn btn-link" @click="showModal('modal-gateway-deposit')">Deposit THX to Gateway</button></li>
            <li v-if="account.rinkeby.address"><button class="btn btn-link" @click="showModal('modal-gateway-withdraw')">Withdraw THX from Gateway</button></li>
            <li v-if="account.rinkeby.address && isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-add-minter')">Add minter role</button></li>
            <li v-if="account.rinkeby.address && isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-mint-rinkeby')">Mint tokens</button></li>
        </ul>

        <template v-if="account.loom.address">
            <h3>Loom Network actions</h3>
            <ul class="list-bullets">
                <li v-if="isLoomMinter"><button class="btn btn-link" @click="showModal('modal-mint-loom')">Mint Loom tokens</button></li>
                <li><button class="btn btn-link" @click="showModal('modal-transfer')">Transfer tokens</button></li>
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

        <BModal title="Connect accounts" centered ref="modal-connect">
            <p>Add private keys for the loom sidechain and the parent Rinkeby network. These keys will only be stored on your device and used to verify transactions.</p>
            <div class="form-group">
                <label>Loom private key:</label>
                <input v-model="input.loomPrivateKey" type="text" class="form-control" placeholder="Your Loom private key">
            </div>
            <div class="form-group">
                <label>Rinkeby private key:</label>
                <input v-model="input.rinkebyPrivateKey" type="text" class="form-control" placeholder="Your Rinkeby private key">
            </div>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onCreateAccountsFromPrivateKey()">Connect</BButton>
            </template>
        </BModal>

        <BModal title="Add minter role" centered ref="modal-add-minter">
            <p>Provide an account with the minting role so it can generate THX on the sidechain.</p>

            <template v-if="!loading">
                <p>Lorem ipsum dolor sit amet.</p>
                <input v-model="input.newMinterAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onAddMinter()">Connect Accounts</BButton>
            </template>
        </BModal>

        <BModal title="Mint tokens for Rinkeby account" centered ref="modal-mint-rinkeby">

            <template v-if="!loading" >
                <input v-model="input.mintForAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintForAccount()">Mint {{ input.mintForAccount }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Mint tokens for Loom account" centered ref="modal-mint-loom">

            <template v-if="!loading">
                <input v-model="input.mintForLoomAccount" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onMintForLoomAccount()">Mint {{ input.mintForLoomAccount }} THX </BButton>
            </template>

        </BModal>

        <BModal title="Deposit THX to Transfer Gateway" centered ref="modal-gateway-deposit">
            <p>Use the transfer gateway to move your THX from the sidechain on to the main ethereum chain.</p>
            <template v-if="!loading">
                <input v-model="input.depositToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onDepositToGateway()">Deposit {{ input.depositToGateway }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Withdraw THX to Transfer Gateway" centered ref="modal-gateway-withdraw">
            <p>Use the transfer gateway to move your THX from the sidechain on to the main ethereum chain.</p>
            <template v-if="!loading">
                <input v-model="input.withdrawToGateway" type="number" class="form-control"  min="0" />
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onWithdrawToGateway()">Withdraw {{ input.withdrawToGateway }} THX </BButton>
            </template>
        </BModal>

        <BModal title="Transfer tokens on sidechain" centered ref="modal-transfer">
            <p>Transfer an amount of THX to another wallet on the sidechain. To send it to a wallet on the main network, use the transfer gateway.</p>

            <template v-if="!loading">
                <div class="form-group">
                    <input v-model="input.transferTokensAddress" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000" />
                </div>
                <div class="form-group">
                    <input v-model="input.transferTokens" type="number" class="form-control"  v-bind:max="balance.token" />
                </div>
            </template>

            <template v-if="loading">
                <div class="text-center">
                    <BSpinner label="Loading..."></BSpinner>
                </div>
            </template>

            <template v-slot:modal-footer="{ ok, cancel, hide }">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="onTransferTokens()">Transfer {{ input.transferTokens }} THX</BButton>
            </template>
        </BModal>

    </main>
</article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { BButton, BModal, BSpinner } from 'bootstrap-vue';
import ProfilePicture from '../components/ProfilePicture';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'home',
    components: {
        BSpinner,
        BButton,
        BModal,
        ProfilePicture,
    },
    data: function() {
        return {
            loading: false,
            uid: firebase.auth().currentUser.uid,
            isLoomMinter: false,
            isRinkebyMinter: false,
            balance: {
                token: 0,
                pool: 0
            },
            input: {
                loomPrivateKey: '',
                rinkebyPrivateKey: '',
                mintForAccount: 0,
                mintForLoomAccount: 0,
                newMinterAddress: "",
                transferTokensAddress: "",
                transferTokens: 0,
                depositToGateway: 0,
                withdrawToGateway: 0,
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
        showModal(id) {
            this.$refs[id].show();
        },
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

            return THX.network.depositToRinkebyGateway(this.input.depositToGateway)
                .then(() => {
                    this.input.depositToGateway = 0;
                    this.loading = false;
                    this.$refs['modal-gateway-deposit'].hide();
                });
        },
        onTransferTokens() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const amount = new BN(this.input.transferTokens).mul(tokenMultiplier);

            return token.methods.transfer(this.input.transferTokensAddress, amount.toString()).send({ from: this.account.loom.address }).then(async () => {
                let balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.input.transferTokens = 0;
                this.$refs['modal-transfer'].hide();
            });
        },
        onMintForAccount() {
            const THX = window.THX;

            return THX.network.mint(this.account.rinkeby.address, this.input.mintForAccount)
                .then(() => {
                    this.input.depositToGateway = 0;
                    this.loading = false;
                    this.$refs['modal-mint-rinkeby'].hide();
                });
        },
        onMintForLoomAccount() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const amount = new BN(this.input.mintForLoomAccount).mul(tokenMultiplier);

            this.loading = true;

            return token.methods.mint(this.account.loom.address, amount.toString()).send({ from: this.account.loom.address}).then(async () => {
                const balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
                this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

                this.$parent.$refs.header.updateBalance();

                this.input.mintForLoomAccount = 0;
                this.loading = false;
                this.$refs['modal-mint-loom'].hide();
            });
        },
        onAddMinter() {
            const THX = window.THX;
            const token = THX.network.instances.token;

            this.loading = true;

            return token.methods.addMinter(this.input.newMinterAddress).send({ from: this.account.loom.address }).then(async () => {
                this.loading = false;
                this.$refs['modal-add-minter'].hide();
            });
        }
    }
}
</script>
