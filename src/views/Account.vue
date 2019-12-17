<template>
<article class="region region-container">
    <main class="region region-content">

        <h2>{{account.firstName}} {{account.lastName}}</h2>

        <BAlert v-if="alert" show :variant="alert.variant ? alert.variant : 'info'">
          {{ alert.text }}
        </BAlert>

        <div class="card mb-3">
            <div class="card-body">
                <span v-if="!account.picture" class="float-left mr-3">
                    <label class="text-center">
                        <ProfilePicture size="lg" :uid="uid"></ProfilePicture><br>
                        <span class="btn btn-link">Upload image</span>
                        <input type="file" @change="onFileChange" class="d-none">
                    </label>
                </span>
                <span v-else class="float-left mr-3 text-center">
                    <ProfilePicture size="lg" :uid="uid"></ProfilePicture><br>
                    <button class="btn btn-link" @click="removeImage">Delete</button>
                </span>

                <h3>E-mail:</h3>
                <p>{{account.email}}</p>

                <h3>UID:</h3>
                <p>{{account.uid}}</p>
                <hr class="mt-5">
                <button class="btn btn-link btn-block" @click="showModal('modal-connect')">Connect Accounts</button>
            </div>
        </div>

        <div class="card mb-3" v-if="account.rinkeby.address">
            <div class="card-header">
                <strong>Rinkeby Network</strong><br>
                <small>{{account.rinkeby.address}} <a class="text-primary" @click="copyClipboard(account.rinkeby.address)">({{clipboard === account.rinkeby.address ? 'Copied!' : 'Copy'}})</a></small>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-deposit')">Deposit THX to Gateway</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-gateway-withdraw')">Withdraw THX from Gateway</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-add-minter')">Add minter role</button></li>
                    <li v-if="isRinkebyMinter"><button class="btn btn-link" @click="showModal('modal-mint-rinkeby')">Mint tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="card mb-3" v-if="account.loom.address">
            <div class="card-header">
                <strong>Loom Network</strong><br>
                <small>{{account.loom.address}} <a class="text-primary" @click="copyClipboard(account.loom.address)">({{clipboard === account.loom.address ? 'Copied!' : 'Copy'}})</a></small>
            </div>
            <div class="card-body">
                <ul class="list-bullets">
                    <!-- <li><button class="btn btn-link" @click="showModal('modal-account-mapping')">Remove account mapping</button></li> -->
                    <li v-if="isLoomMinter"><button class="btn btn-link" @click="showModal('modal-mint-loom')">Mint Loom tokens</button></li>
                    <li><button class="btn btn-link" @click="showModal('modal-transfer')">Transfer tokens</button></li>
                </ul>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button @click="reset()" class="btn btn-link mr-2">Reset</button>
            <button @click="logout()" class="btn btn-primary">Logout</button>
        </div>

        <BModal title="Decouple account from wallet" centered ref="modal-account-mapping">
            <hr>
            <div class="text-center">
                <small>Loom Network address </small><br>
                <small class="badge badge-primary">{{account.loom.address}}</small><br>
                <small>is mapped to User ID</small><br>
                <small class="badge badge-primary">{{account.uid}}</small>
            </div>
            <hr>
            <p>Use this feature to decouple the Loom address from your User account and use your Loom address for another THX user account.</p>
            <template slot="modal-footer">
                <BButton size="sm" v-bind:class="{ disabled: loading }" class="btn btn-primary" @click="removeMapping(account.loom.address)">Decouple wallet</BButton>
            </template>
        </BModal>

        <BModal title="Connect accounts" centered ref="modal-connect">
            <p>Add private keys for the loom sidechain and the parent Rinkeby network. These keys will only be stored on your device and used to verify transactions.</p>
            <div class="alert alert-warning"><strong>Make sure to store your private keys safely and not only on this device. We can not recover your keys!</strong></div>
            <div class="form-group">
                <label>Loom private key:</label>
                <div class="input-group">
                    <input v-model="input.loomPrivateKey" type="text" class="form-control" placeholder="Paste or create your Loom private key">
                    <div class="input-group-append">
                        <span @click="createLoomKey()" class="input-group-text btn btn-link">Create new key</span>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Rinkeby private key:</label>
                <div class="input-group">
                    <input v-model="input.rinkebyPrivateKey" type="text" class="form-control" placeholder="Paste or create your Rinkeby private key">
                    <div class="input-group-append">
                        <span @click="createRinkebyKey()" class="input-group-text btn btn-link">Create new key</span>
                    </div>
                </div>
            </div>

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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

            <template slot="modal-footer">
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
import { BAlert, BButton, BModal, BSpinner } from 'bootstrap-vue';
import ProfilePicture from '../components/ProfilePicture';
import { CryptoUtils, LocalAddress } from 'loom-js';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default {
    name: 'home',
    components: {
        BSpinner,
        BButton,
        BModal,
        BAlert,
        ProfilePicture,
    },
    data: function() {
        return {
            loading: false,
            uid: firebase.auth().currentUser.uid,
            isLoomMinter: false,
            isRinkebyMinter: false,
            alert: null,
            clipboard: null,
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
        const THX = window.THX;
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

            if (THX.network.hasKeys) {
                this.init();
            }
        });
    },
    methods: {
        showModal(id) {
            this.$refs[id].show();
        },
        copyClipboard(value) {
            const input = document.createElement('input');

            input.id = 'clippy';
            input.type = 'type';
            input.value = value;
            input.style = {
                position: 'absolute',
                left: '-999999px',
                width: '0px',
                height: '0px',
            }

            document.getElementById('app').appendChild(input);
            document.getElementById('clippy').select();
            document.execCommand('copy');
            document.getElementById('clippy').remove();

            this.clipboard = value;
        },
        createLoomKey() {
            const privateKeyArray = CryptoUtils.generatePrivateKey()
            const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKeyArray);

            this.input.loomPrivateKey = privateKeyString;
        },
        createRinkebyKey() {
            const THX = window.THX;
            const account = THX.network.rinkeby.eth.accounts.create();

            this.input.rinkebyPrivateKey = account.privateKey;
        },
        async init() {
            const THX = window.THX;
            const token = THX.network.instances.token;
            const tokenRinkeby = THX.network.instances.tokenRinkeby;
            let balanceInWei

            this.account.loom = THX.network.account;
            this.account.rinkeby = THX.network.rinkeby.account;

            this.input.loomPrivateKey = THX.state.loomPrivateKey;
            this.input.rinkebyPrivateKey = THX.state.rinkebyPrivateKey;

            balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);
            this.isLoomMinter = await token.methods.isMinter(this.account.loom.address).call();

            balanceInWei = await tokenRinkeby.methods.balanceOf(this.account.rinkeby.address).call();
            this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
            this.isRinkebyMinter = await tokenRinkeby.methods.isMinter(this.account.rinkeby.address).call();

            this.$parent.$refs.header.updateBalance();
        },
        isDuplicateAddress(address) {
            const uid = firebase.auth().currentUser.uid;
            const walletRef = firebase.database().ref(`wallets/${address}`);

            return walletRef.once('value').then(s => {
                return s.exists() && s.val().uid !== uid;
            });
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
        async removeMapping(address) {
            const walletRef = firebase.database().ref(`wallets/${address}`);
            await walletRef.remove();

            return this.$refs['modal-account-mapping'].hide();
        },
        reset() {
            const THX = window.THX;
            THX.state.clear();

            this.removeMapping(this.account.loom.address);

            return window.location.reload();
        },
        async onCreateAccountsFromPrivateKey() {
            const THX = window.THX;
            const uid = firebase.auth().currentUser.uid;
            const privateKeyArray = CryptoUtils.B64ToUint8Array(this.input.loomPrivateKey);
            const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
            const address = LocalAddress.fromPublicKey(publicKey).toString().toLowerCase();
            const prevWalletRef = firebase.database().ref(`wallets/${this.account.loom.address}`);
            const walletRef = firebase.database().ref(`wallets/${address}`);
            const isDuplicate = await this.isDuplicateAddress(address);

            if (!isDuplicate) {
                prevWalletRef.remove();

                walletRef.child('uid').set(uid);

                await THX.gateway.mapAccounts(this.input.rinkebyPrivateKey, this.input.loomPrivateKey)

                this.alert = {
                    text: 'Your account is connected. The app will restart in 3 seconds.',
                    variant: 'success',
                }

                THX.state.loomPrivateKey = this.input.loomPrivateKey;

                window.setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
            else {
                this.alert = {
                    text: 'The loom private key provided is already in use and will not be stored.',
                    variant: 'danger',
                }
            }

            THX.state.rinkebyPrivateKey = this.input.rinkebyPrivateKey;
            THX.state.save();

            this.$refs['modal-connect'].hide();
        },
        onDepositToGateway() {
            const THX = window.THX;

            this.loading = true;

            return THX.gateway.depositCoin(this.input.depositToGateway)
                .then(() => {
                    this.input.depositToGateway = 0;
                    this.loading = false;
                    this.$refs['modal-gateway-deposit'].hide();
                });
        },
        onWithdrawToGateway() {
            const THX = window.THX;

            this.loading = true;

            return THX.gateway.withdrawCoin(this.input.withdrawToGateway)
                .then(() => {
                    this.input.withdrawToGateway = 0;
                    this.loading = false;
                    this.$refs['modal-gateway-withdraw'].hide();
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
            const tokenRinkeby = THX.network.instances.tokenRinkeby;

            this.loading = true;

            return tokenRinkeby.methods.addMinter(this.input.newMinterAddress).send({ from: this.account.rinkeby.address }).then(async () => {
                this.loading = false;
                this.$refs['modal-add-minter'].hide();
            });
        }
    }
}
</script>
