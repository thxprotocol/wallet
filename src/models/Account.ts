import { Vue } from 'vue-property-decorator';
import { Profile } from './Profile';
import { Network } from './Network';
import BN from 'bn.js';

const tokenMultiplier = new BN(10).pow(new BN(18));

export class Account extends Vue {
    private $network!: Network;
    public uid: string = '';
    public profile: Profile | null = null;

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
        const address = this.$network.rinkeby.account.address;
        const web3js = this.$network.rinkeby.web3js;
        const balanceInWei = await this.$network.getRinkebyCoinBalance(web3js, address);

        return new BN(balanceInWei).div(tokenMultiplier)
    }

    public async getExtdevCoinBalance() {
        const address = this.$network.extdev.account;
        const web3js = this.$network.extdev.web3js;
        const balanceInWei = await this.$network.getExtdevCoinBalance(web3js, address);

        return new BN(balanceInWei).div(tokenMultiplier)

    }

    public async getEthBalance() {
        const address = this.$network.rinkeby.account.address;
        const balanceInWei = await this.$network.rinkeby.web3js.eth.getBalance(address);
        const utils = this.$network.web3js.utils;

        return Math.floor(utils.fromWei(balanceInWei) * 100000) / 100000;
    }

}
