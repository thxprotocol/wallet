import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase';
import 'firebase/auth';
import EventAggregator from '../services/EventAggregator';
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
    private $network!: Network;
    public balance: any = {
        eth: 0,
        token: 0,
        tokenRinkeby: 0,
    };

    created() {
        this.updateBalance();

        // Subscribe for coin balance events
    }

    public async updateBalance() {
        const rinkebyAddr = this.$network.rinkeby.account.address;
        const extdevAddr = this.$network.extdev.account;
        const rinkebyCoinBalance = await this.$network.getRinkebyCoinBalance(this.$network.rinkeby.web3js, rinkebyAddr);
        const extdevCoinBalance = await this.$network.getExtdevCoinBalance(this.$network.extdev.web3js, extdevAddr);
        const balanceInWei = await this.$network.rinkeby.web3js.eth.getBalance(rinkebyAddr);

        this.balance.tokenRinkeby = new BN(rinkebyCoinBalance).div(tokenMultiplier);
        this.balance.token = new BN(extdevCoinBalance).div(tokenMultiplier);
        this.balance.eth = this.$network.rinkeby.web3js.utils.fromWei(balanceInWei, 'ether');
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
