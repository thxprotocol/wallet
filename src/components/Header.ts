import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase';
import 'firebase/auth';
import EventAggregator from '../services/EventAggregator';
import ProfilePicture from '../components/ProfilePicture.vue';

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

    public async updateBalance() {
        const token = THX.network.instances.token;
        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        const address = THX.network.account.address;
        const addressRinkeby = THX.network.rinkeby.account.address;
        let balanceInWei;

        balanceInWei = await THX.network.rinkeby.eth.getBalance(addressRinkeby);
        this.balance.eth = THX.network.rinkeby.utils.fromWei(balanceInWei, 'ether');

        balanceInWei = await token.methods.balanceOf(address).call();
        this.balance.token = new BN(balanceInWei).div(tokenMultiplier);

        balanceInWei = await tokenRinkeby.methods.balanceOf(addressRinkeby).call();
        this.balance.tokenRinkeby = new BN(balanceInWei).div(tokenMultiplier);
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
