import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { CryptoUtils, LocalAddress } from 'loom-js';
import { BOverlay, BAlert, BButton, BModal, BSpinner } from 'bootstrap-vue';
import ProfilePicture from '@/components/ProfilePicture.vue';
import { Account } from '@/models/Account';
import StateService from '@/services/StateService';
import BN from 'bn.js';
import UserService from '@/services/UserService';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'AccountDetail',
    components: {
        'b-overlay': BOverlay,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-modal': BModal,
        'b-alert': BAlert,
        'profile-picture': ProfilePicture,
    },
    computed: {
        ...mapGetters({
            account: 'account',
        }),
    },
})
export default class AccountDetail extends Vue {
    private updating: any = false;
    private loading: any = false;
    private isExtdevMinter: boolean = false;
    private isRinkebyMinter: boolean = false;
    private alert: any = null;
    private clipboard: any = null;
    private txHash: string = '';
    private input: any = {
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
    private account!: Account;
    private $state!: StateService;
    private userService: UserService = new UserService();

    public async created() {
        this.input.extdevPrivateKey = this.$state.extdevPrivateKey;
        this.input.rinkebyPrivateKey = this.$state.rinkebyPrivateKey;

        if (this.$network.extdev && this.$network.extdev.account) {
            this.isExtdevMinter = await this.$network.isExtdevMinter(
                this.$network.extdev.web3js,
                this.$network.extdev.account,
            );
        }
        if (this.$network.rinkeby && this.$network.rinkeby.account) {
            this.isRinkebyMinter = await this.$network.isRinkebyMinter(
                this.$network.rinkeby.web3js,
                this.$network.rinkeby.account.address,
            );
        }
    }

    public onFileChange(e: any) {
        const name = `${this.account.uid}.jpg`;
        const files = e.target.files || e.dataTransfer.files;

        if (this.account) {
            this.account.setPicture(name, files);
        }
    }

    public async removeImage() {
        if (this.account) {
            this.account.removePicture();
        }
    }

    public logout() {
        this.$router.push('/logout');
    }

    public async reset() {
        this.$state.clear();

        await this.userService.removeMapping(this.$network.extdev.account);

        return window.location.reload();
    }

    public async onCreateAccountsFromPrivateKey() {
        const privateKeyArray = CryptoUtils.B64ToUint8Array(this.input.extdevPrivateKey);
        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyArray);
        const address = LocalAddress.fromPublicKey(publicKey)
            .toString()
            .toLowerCase();

        this.loading = true;

        await this.userService.updateMapping(address, this.account.uid);
        await this.$network.mapAccounts(this.input.rinkebyPrivateKey, this.input.extdevPrivateKey);

        this.alert = {
            text: 'Your connection is established. The app will restart in 3 seconds.',
            variant: 'success',
        };

        this.$state.extdevPrivateKey = this.input.extdevPrivateKey;
        this.$state.rinkebyPrivateKey = this.input.rinkebyPrivateKey;
        this.$state.save();

        this.loading = false;

        (this.$refs['modal-connect'] as any).hide();

        window.setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    public onDeposit() {
        this.loading = true;
        this.$network
            .depositCoin(this.input.depositToGateway)
            .then((hash: any) => {
                this.txHash = hash;
                this.input.depositToGateway = 0;
                this.loading = false;
                (this.$refs['modal-gateway-deposit'] as any).hide();
            })
            .catch((e: string) => {
                this.alert = {
                    text: e,
                    type: 'danger',
                };
            });
    }

    public onWithdraw() {
        this.loading = true;
        this.$network
            .withdrawCoin(this.input.withdrawToGateway)
            .then((hash: any) => {
                this.txHash = hash;
                this.input.withdrawToGateway = 0;
                this.loading = false;
                (this.$refs['modal-gateway-withdraw'] as any).hide();
            })
            .catch((e: string) => {
                this.alert = {
                    text: e,
                    type: 'danger',
                };
            });
    }

    public onTransferRinkebyCoin() {
        const amount = new BN(this.input.transferRinkebyCoinAmount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferRinkebyCoin(this.input.transferRinkebyCoinAddress, amount).then(() => {
            this.loading = false;
            this.input.transferRinkebyCoinAddress = '';
            this.input.transferRinkebyCoinAmount = 0;
            (this.$refs['modal-transfer-coin-rinkeby'] as any).hide();
        });
    }

    public onTransferExtdevCoin() {
        const amount = new BN(this.input.transferTokens).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferExtdevCoin(this.input.transferTokensAddress, amount).then(() => {
            this.loading = false;
            this.input.transferTokens = 0;
            this.input.transferTokensAddress = '';
            (this.$refs['modal-transfer-coin-extdev'] as any).hide();
        });
    }

    public onTransferEther() {
        const amount = new BN(this.input.transferEtherAmount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.transferEther(this.input.transferEtherAddress, amount).then((tx: any) => {
            this.loading = false;
            this.input.transferEtherAmount = 0;
            this.input.transferEtherAddress = '';
            (this.$refs['modal-transfer-ether'] as any).hide();
        });
    }

    public onMintRinkebyCoin() {
        const amount = new BN(this.input.mintForAccount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.mintRinkebyCoin(this.$network.rinkeby.account.address, amount).then(() => {
            this.input.mintForAccount = 0;
            this.loading = false;
            (this.$refs['modal-mint-rinkeby'] as any).hide();
        });
    }

    public onMintExtdevCoin() {
        const amount = new BN(this.input.mintForLoomAccount).mul(TOKEN_MULTIPLIER);

        this.loading = true;

        return this.$network.mintExtdevCoin(this.$network.extdev.account, amount).then(() => {
            this.input.mintForExtdevAccount = 0;
            this.loading = false;
            (this.$refs['modal-mint-extdev'] as any).hide();
        });
    }

    public onAddRinkebyMinter() {
        this.loading = true;

        return this.$network.addRinkebyMinter(this.input.newMinterAddress).then(() => {
            this.loading = false;
            (this.$refs['modal-add-minter'] as any).hide();
        });
    }

    private async onUpdateAccount(account: Account) {
        this.updating = true;
        await this.userService.update(account);
        this.updating = false;
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
