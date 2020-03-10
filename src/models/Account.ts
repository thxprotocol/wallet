import { Vue } from 'vue-property-decorator';
import { Profile } from './Profile';
import NetworkService from '@/services/NetworkService';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class Account extends Vue {
    public uid: string = '';
    public profile: Profile | null = null;
    private $network!: NetworkService;

    constructor(
        currentUser: firebase.User | any,
    ) {
        super();

        if (currentUser) {
            this.uid = currentUser.uid;
            this.profile = new Profile(currentUser.uid);
        }
    }

    public async getRinkebyCoinBalance() {
        if (this.$network.rinkeby) {
            const address = this.$network.rinkeby.account.address;
            const web3js = this.$network.rinkeby.web3js;
            const balanceInWei = await this.$network.getRinkebyCoinBalance(web3js, address);

            return new BN(balanceInWei).div(TOKEN_MULTIPLIER);
        } else {
            return new BN(0);
        }
    }

    public async getExtdevCoinBalance() {
        if (this.$network.extdev) {
            const address = this.$network.extdev.account;
            const web3js = this.$network.extdev.web3js;
            const balanceInWei = await this.$network.getExtdevCoinBalance(web3js, address);

            return new BN(balanceInWei).div(TOKEN_MULTIPLIER);
        } else {
            return new BN(0);
        }
    }

    public async getEthBalance() {
        if (this.$network.rinkeby) {
            const address = this.$network.rinkeby.account.address;
            const balanceInWei = await this.$network.rinkeby.web3js.eth.getBalance(address);
            const utils = this.$network.web3js.utils;

            return Math.floor(utils.fromWei(balanceInWei) * 100000) / 100000;
        } else {
            return new BN(0);
        }
    }

}
