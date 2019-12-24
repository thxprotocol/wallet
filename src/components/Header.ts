import { Component, Prop, Vue } from 'vue-property-decorator';
import ProfilePicture from '../components/ProfilePicture.vue';
import { Network } from '../models/Network';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'Header',
    components: {
        ProfilePicture,
    },
})
export default class Header extends Vue {
    public balance: any = {
        eth: 0,
        token: 0,
        tokenRinkeby: 0,
    };
    private $network!: Network;

    public created() {
        // Subscribe for coin balance events if there is a network
        this.updateBalance();
    }

    public async updateBalance() {
        if (this.$network.rinkeby && this.$network.extdev) {
            const rinkebyAddr = this.$network.rinkeby.account.address;
            const extdevAddr = this.$network.extdev.account;
            const rinkebyCoinBalance = await this.$network.getRinkebyCoinBalance(this.$network.rinkeby.web3js, rinkebyAddr);
            const extdevCoinBalance = await this.$network.getExtdevCoinBalance(this.$network.extdev.web3js, extdevAddr);
            const balanceInWei = await this.$network.rinkeby.web3js.eth.getBalance(rinkebyAddr);

            this.balance.tokenRinkeby = new BN(rinkebyCoinBalance).div(tokenMultiplier);
            this.balance.token = new BN(extdevCoinBalance).div(tokenMultiplier);
            this.balance.eth = this.$network.rinkeby.web3js.utils.fromWei(balanceInWei, 'ether');
        }
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
