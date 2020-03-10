import { Component, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { CryptoUtils, LocalAddress } from 'loom-js';
import { BAlert, BButton, BModal, BSpinner } from 'bootstrap-vue';
import ProfilePicture from '../components/ProfilePicture.vue';
import Header from '../components/Header';
import { Account } from '../models/Account';
import NetworkService from '../services/NetworkService';
import StateService from '@/services/StateService';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'AccountDetail',
    components: {
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-modal': BModal,
        'b-alert': BAlert,
        'profile-picture': ProfilePicture,
    },
})
export default class AccountDetail extends Vue {

    get account() {
        return this.$account;
    }
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
        transferRinkebyCoinAddress: '',
        transferRinkebyCoinAmount: 0,
        transferEtherAddress: '',
        transferEtherAmount: 0,
    };

    private $account!: Account;
    private $network!: NetworkService;
    private $state!: StateService;

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

        this.loading = true;

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

        this.loading = false;
        (this.$refs['modal-connect'] as any).hide();
    }

    public onDeposit() {
        this.loading = true;

        return this.$network.depositCoin(this.input.depositToGateway)
            .then(() => {
                this.input.depositToGateway = 0;
                this.loading = false;
                return (this.$refs['modal-gateway-deposit'] as any).hide();
            });
    }

    public onWithdraw() {
        this.loading = true;

        return this.$network.withdrawCoin(this.input.withdrawToGateway)
            .then(() => {
                this.input.withdrawToGateway = 0;
                this.loading = false;
                (this.$refs['modal-gateway-withdraw'] as any).hide();
            });
    }

    public onTransferRinkebyCoin() {
        const amount = new BN(this.input.transferRinkebyCoinAmount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferRinkebyCoin(this.input.transferRinkebyCoinAddress, amount)
            .then(() => {
                this.loading = false;
                this.input.transferRinkebyCoinAddress = '';
                this.input.transferRinkebyCoinAmount = 0;
                (this.$refs['modal-transfer-coin-rinkeby'] as any).hide();
            });
    }

    public onTransferExtdevCoin() {
        const amount = new BN(this.input.transferTokens).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferExtdevCoin(this.input.transferTokensAddress, amount)
            .then(() => {
                this.loading = false;
                this.input.transferTokens = 0;
                this.input.transferTokensAddress = '';
                (this.$refs['modal-transfer-coin-extdev'] as any).hide();
            });
    }


    public onTransferEther() {
        const amount = new BN(this.input.transferEtherAmount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferEther(this.input.transferEtherAddress, amount)
            .then((tx: any) => {
                this.loading = false;
                this.input.transferEtherAmount = 0;
                this.input.transferEtherAddress = '';
                (this.$refs['modal-transfer-ether'] as any).hide();
            });
    }

    public onMintRinkebyCoin() {
        const amount = new BN(this.input.mintForAccount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.mintRinkebyCoin(
            this.$network.rinkeby.account.address,
            amount,
        )
            .then(() => {
                this.input.mintForAccount = 0;
                this.loading = false;
                (this.$refs['modal-mint-rinkeby'] as any).hide();
            });
    }

    public onMintExtdevCoin() {
        const amount = new BN(this.input.mintForLoomAccount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.mintExtdevCoin(
            this.$network.extdev.account,
            amount,
        )
            .then(() => {
                this.input.mintForExtdevAccount = 0;
                this.loading = false;
                (this.$refs['modal-mint-extdev'] as any).hide();
            });
    }

    public onAddRinkebyMinter() {
        this.loading = true;

        return this.$network.addRinkebyMinter(this.input.newMinterAddress)
            .then(() => {
                this.loading = false;
                (this.$refs['modal-add-minter'] as any).hide();
            });
    }

    private async created() {
        this.input.extdevPrivateKey = this.$state.extdevPrivateKey;
        this.input.rinkebyPrivateKey = this.$state.rinkebyPrivateKey;

        if (this.$network.extdev && this.$network.extdev.account) {
            this.isExtdevMinter = await this.$network.isExtdevMinter(
                this.$network.extdev.web3js, this.$network.extdev.account,
            );
        }
        if (this.$network.rinkeby && this.$network.rinkeby.account) {
            this.isRinkebyMinter = await this.$network.isRinkebyMinter(
                this.$network.rinkeby.web3js,
                this.$network.rinkeby.account.address,
            );
        }
    }

    private showModal(id: string) {
        const modal: any = this.$refs[id];
        modal.show();
    }

    private copyClipboard(value: string) {
        const input = document.createElement('input');

        input.setAttribute('id', 'clippy');
        input.setAttribute('type', 'text');
        input.setAttribute('value', value);
        input.setAttribute('style', 'display: block; opacity: 0;');

        (document as any).getElementById('app').appendChild(input);
        (document as any).getElementById('clippy').select();
        (document as any).execCommand('copy');
        (document as any).getElementById('clippy').remove();

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
