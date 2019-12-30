import { Component, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { CryptoUtils, LocalAddress } from 'loom-js';
import { BAlert, BButton, BModal, BSpinner } from 'bootstrap-vue';
// import ProfilePicture from '../components/ProfilePicture.vue';
import Header from '../components/Header';
import { Account } from '../models/Account';
import { ProfilePicture } from '../models/Profile';
import { Network } from '../models/Network';
import StateService from '@/services/StateService';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'AccountDetail',
    components: {
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-modal': BModal,
        'b-alert': BAlert,
    },
})
export default class AccountDetail extends Vue {

    public loading: any = false;
    public isExtdevMinter: boolean = false;
    public isRinkebyMinter: boolean = false;
    public alert: any = null;
    public clipboard: any = null;
    public input: any = {
        extdevPrivateKey: '',
        rinkebyPrivateKey: '',
        mintForAccount: 0,
        mintForExtdevAccount: 0,
        newMinterAddress: '',
        transferTokensAddress: '',
        transferTokens: 0,
        depositToGateway: 0,
        withdrawToGateway: 0,
    };

    private $account!: Account;
    private $network!: Network;
    private $state!: StateService;

    get account() {
        return this.$account;
    }

    public isDuplicateAddress(address: string) {
        const walletRef = firebase.database().ref(`wallets/${address}`);

        return walletRef.once('value').then((s) => {
            return s.exists() && s.val().uid !== this.$account.uid;
        });
    }

    public onFileChange(e: any) {
        const name = `${this.$account.uid}.jpg`;
        const files = e.target.files || e.dataTransfer.files;

        if (this.$account.profile) {
            this.$account.profile.setPicture(name, files);
        }
    }

    public async removeImage() {
        if (this.$account.profile) {
            this.$account.profile.removePicture();
        }
    }

    public logout() {
        this.$router.push('/logout');
    }

    public async removeMapping(address: string) {
        const walletRef = firebase.database().ref(`wallets/${address}`);
        await walletRef.remove();

        return (this.$refs['modal-account-mapping'] as any).hide();
    }

    public reset() {
        this.$state.clear();

        this.removeMapping(this.$network.extdev.account);

        return window.location.reload();
    }

    public async onCreateAccountsFromPrivateKey() {
        const privateKeyArray = CryptoUtils.B64ToUint8Array(this.input.extdevPrivateKey);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
        const address = LocalAddress.fromPublicKey(publicKey).toString().toLowerCase();
        const walletRef = firebase.database().ref(`wallets/${address}`);
        const isDuplicate = await this.isDuplicateAddress(address);

        // If there is a connection remove the current wallet mapping before
        // setting the new mapping
        if (this.$network.extdev) {
            firebase.database().ref(`wallets/${this.$network.extdev.account}`)
                .remove();
        }

        if (!isDuplicate) {

            walletRef.child('uid').set(this.$account.uid);

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
                text: 'The extdev private key provided is already in use and will not be stored.',
                variant: 'danger',
            };
        }

        this.$state.rinkebyPrivateKey = this.input.rinkebyPrivateKey;
        this.$state.save();

        (this.$refs['modal-connect'] as any).hide();
    }

    public onDepositToGateway() {
        this.loading = true;

        return this.$network.depositCoin(this.input.depositToGateway)
            .then(() => {
                this.input.depositToGateway = 0;
                this.loading = false;
                (this.$parent.$refs.header as Header).updateBalance();

                return (this.$refs['modal-gateway-deposit'] as any).hide();
            });
    }

    public onWithdrawToGateway() {
        this.loading = true;

        return this.$network.withdrawCoin(this.input.withdrawToGateway)
            .then(() => {
                this.input.withdrawToGateway = 0;
                this.loading = false;
                (this.$refs['modal-gateway-withdraw'] as any).hide();
            });
    }

    public onTransferTokens() {
        const amount = new BN(this.input.transferTokens).mul(tokenMultiplier);

        this.loading = true;

        return this.$network.transferCoin(this.input.transferTokensAddress, amount)
            .then(() => {
                this.loading = false;
                this.input.withdrawToGateway = 0;
                (this.$parent.$refs.header as Header).updateBalance();

                this.input.transferTokens = 0;
                (this.$refs['modal-transfer'] as any).hide();
            });
    }

    public onMintRinkebyCoin() {
        const amount = new BN(this.input.mintForAccount).mul(tokenMultiplier);

        this.loading = true;

        return this.$network.mintRinkebyCoin(
            this.$network.rinkeby.account.address,
            amount,
        )
            .then(() => {
                this.input.mintForAccount = 0;
                this.loading = false;

                return (this.$refs['modal-mint-rinkeby'] as any).hide();
            });
    }

    public onMintExtdevCoin() {
        const amount = new BN(this.input.mintForLoomAccount).mul(tokenMultiplier);

        this.loading = true;

        return this.$network.mintExtdevCoin(
            this.$network.extdev.address,
            amount.toString(),
        )
            .then(() => {
                this.input.mintForExtdevAccount = 0;
                this.loading = false;

                return (this.$refs['modal-mint-extdev'] as any).hide();
            });
    }

    public onAddRinkebyMinter() {
        this.loading = true;

        return this.$network.addRinkebyMinter(this.input.newMinterAddress)
            .then(() => {
                this.loading = false;

                return (this.$refs['modal-add-minter'] as any).hide();
            });
    }

    private async created() {
        this.input.extdevPrivateKey = this.$state.extdevPrivateKey;
        this.input.rinkebyPrivateKey = this.$state.rinkebyPrivateKey;

        if (this.$network.extdev && this.$network.extdev.account) {
            this.isExtdevMinter = await this.$network.isExtdevMinter(this.$network.extdev.web3js, this.$network.extdev.account);
        }
        if (this.$network.rinkeby && this.$network.rinkeby.account) {
            this.isRinkebyMinter = await this.$network.isRinkebyMinter(this.$network.rinkeby.web3js, this.$network.rinkeby.account.address);
        }
    }

    private showModal(id: string) {
        const modal: any = this.$refs[id];
        modal.show();
    }

    private copyClipboard(value: string) {
        const input = document.createElement('input');
        const d: any = document;

        input.id = 'clippy';
        input.type = 'type';
        input.value = value;
        input.style.position = 'absolute';
        input.style.left = '-999999px';
        input.style.width = '0px';
        input.style.height = '0px';

        d.getElementById('app').appendChild(input);
        d.getElementById('clippy').select();
        d.execCommand('copy');
        d.getElementById('clippy').remove();

        this.clipboard = value;
    }

    private createExtdevKey() {
        const privateKeyArray = CryptoUtils.generatePrivateKey();
        const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKeyArray);

        this.input.extdevPrivateKey = privateKeyString;
    }

    private createRinkebyKey() {
        const account = this.$network.web3js.eth.accounts.create();

        this.input.rinkebyPrivateKey = account.privateKey;
    }
}