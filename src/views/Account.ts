import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { BAlert, BButton, BModal, BSpinner } from 'bootstrap-vue';
import ProfilePicture from '../components/ProfilePicture.vue';
import { CryptoUtils, LocalAddress } from 'loom-js';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'Account',
    components: {
        BSpinner,
        BButton,
        BModal,
        BAlert,
        ProfilePicture,
    },
})
export default class Account extends Vue {
    public loading: any = false;
    public uid: string = '';
    public isLoomMinter: any = false;
    public isRinkebyMinter: any = false;
    public alert: any = null;
    public clipboard: any = null;
    public balance: any = {
        token: 0,
        pool: 0,
    };
    public input: any = {
        extdevPrivateKey: '',
        rinkebyPrivateKey: '',
        mintForAccount: 0,
        mintForLoomAccount: 0,
        newMinterAddress: '',
        transferTokensAddress: '',
        transferTokens: 0,
        depositToGateway: 0,
        withdrawToGateway: 0,
    };
    public account: any = {
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
        },
    };

    public created() {
        this.uid = firebase.auth().currentUser.uid;

        firebase.database().ref(`users/${this.uid}`).once('value').then(async (s) => {
            const u = s.val();
            const picture = u.picture;

            if (picture) {
                this.account.picture = picture.url;
            }

            this.account.firstName = u.firstName;
            this.account.lastName = u.lastName;
            this.account.uid = u.uid;
            this.account.email = u.email;
        });
    }

    public showModal(id: string) {
        this.$refs[id].show();
    }

    public copyClipboard(value: string) {
        const input = document.createElement('input');

        input.id = 'clippy';
        input.type = 'type';
        input.value = value;
        input.style.position = 'absolute';
        input.style.left = '-999999px';
        input.style.width = '0px';
        input.style.height = '0px';

        document.getElementById('app').appendChild(input);
        document.getElementById('clippy').select();
        document.execCommand('copy');
        document.getElementById('clippy').remove();

        this.clipboard = value;
    }

    public createLoomKey() {
        const privateKeyArray = CryptoUtils.generatePrivateKey();
        const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKeyArray);

        this.input.extdevPrivateKey = privateKeyString;
    }

    public createRinkebyKey() {
        const account = THX.network.rinkeby.eth.accounts.create();

        this.input.rinkebyPrivateKey = account.privateKey;
    }

    public async init() {
        const token = THX.network.instances.token;
        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        let balanceInWei;

        this.account.loom = THX.network.account;
        this.account.rinkeby = THX.network.rinkeby.account;

        this.input.extdevPrivateKey = THX.state.extdevPrivateKey;
        this.input.rinkebyPrivateKey = THX.state.rinkebyPrivateKey;

        balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
        this.balance.token = new BN(balanceInWei).div(tokenMultiplier);
        this.isLoomMinter = await token.methods.isMinter(this.account.loom.address).call();

        balanceInWei = await tokenRinkeby.methods.balanceOf(this.account.rinkeby.address).call();
        this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
        this.isRinkebyMinter = await tokenRinkeby.methods.isMinter(this.account.rinkeby.address).call();

        this.$parent.$refs.header.updateBalance();
    }

    public isDuplicateAddress(address: string) {
        const walletRef = firebase.database().ref(`wallets/${address}`);

        return walletRef.once('value').then((s) => {
            return s.exists() && s.val().uid !== this.uid;
        });
    }

    public onFileChange(e: any) {
        const avatarRef = firebase.storage().ref('avatars');
        const files = e.target.files || e.dataTransfer.files;
        const fileName = `${this.uid}.jpg`;

        avatarRef.child(fileName).put(files[0]).then(async (s) => {
            const url = await s.ref.getDownloadURL();

            this.account.picture = url;

            firebase.database().ref('users').child(this.uid).update({ picture: { name: fileName, url }});
        });
    }

    public async removeImage() {
        const avatarRef = firebase.storage().ref('avatars');
        const pictureRef = firebase.database().ref(`users/${this.uid}/picture`);
        const fileName = (await pictureRef.child('name').once('value')).val();

        avatarRef.child(fileName).delete().then(() => {
            pictureRef.remove().then(() => {
                this.account.picture = null;
            });
        });
    }

    public logout() {
        this.$router.push('/logout');
    }

    public async removeMapping(address: string) {
        const walletRef = firebase.database().ref(`wallets/${address}`);
        await walletRef.remove();

        return this.$refs['modal-account-mapping'].hide();
    }

    public reset() {
        THX.state.clear();

        this.removeMapping(this.account.loom.address);

        return window.location.reload();
    }

    public async onCreateAccountsFromPrivateKey() {
        const privateKeyArray = CryptoUtils.B64ToUint8Array(this.input.extdevPrivateKey);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
        const address = LocalAddress.fromPublicKey(publicKey).toString().toLowerCase();
        const prevWalletRef = firebase.database().ref(`wallets/${this.account.loom.address}`);
        const walletRef = firebase.database().ref(`wallets/${address}`);
        const isDuplicate = await this.isDuplicateAddress(address);

        if (!isDuplicate) {
            prevWalletRef.remove();

            walletRef.child('uid').set(this.uid);

            await this.$network.mapAccounts(this.input.rinkebyPrivateKey, this.input.extdevPrivateKey);

            this.alert = {
                text: 'Your account is connected. The app will restart in 3 seconds.',
                variant: 'success',
            };

            this.$state.extdevPrivateKey = this.input.extdevPrivateKey;

            window.setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            this.alert = {
                text: 'The loom private key provided is already in use and will not be stored.',
                variant: 'danger',
            };
        }

        this.$state.rinkebyPrivateKey = this.input.rinkebyPrivateKey;
        this.$state.save();

        this.$refs['modal-connect'].hide();
    }

    public onDepositToGateway() {
        this.loading = true;

        return THX.gateway.depositCoin(this.input.depositToGateway)
            .then(() => {
                this.input.depositToGateway = 0;
                this.loading = false;
                this.$refs['modal-gateway-deposit'].hide();
            });
    }

    public onWithdrawToGateway() {
        this.loading = true;

        return THX.gateway.withdrawCoin(this.input.withdrawToGateway)
            .then(() => {
                this.input.withdrawToGateway = 0;
                this.loading = false;
                this.$refs['modal-gateway-withdraw'].hide();
            });
    }

    public onTransferTokens() {
        const token = THX.network.instances.token;
        const amount = new BN(this.input.transferTokens).mul(tokenMultiplier);

        return token.methods.transfer(this.input.transferTokensAddress, amount.toString()).send({ from: this.account.loom.address }).then(async () => {
            const balanceInWei = await token.methods.balanceOf(this.account.loom.address).call();
            this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

            this.$parent.$refs.header.updateBalance();

            this.input.transferTokens = 0;
            this.$refs['modal-transfer'].hide();
        });
    }

    public onMintForAccount() {
        return THX.network.mint(this.account.rinkeby.address, this.input.mintForAccount)
            .then(() => {
                this.input.depositToGateway = 0;
                this.loading = false;
                this.$refs['modal-mint-rinkeby'].hide();
            });
    }

    public onMintForLoomAccount() {
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
    }

    public onAddMinter() {
        const tokenRinkeby = THX.network.instances.tokenRinkeby;

        this.loading = true;

        return tokenRinkeby.methods.addMinter(this.input.newMinterAddress).send({ from: this.account.rinkeby.address }).then(async () => {
            this.loading = false;
            this.$refs['modal-add-minter'].hide();
        });
    }
}
