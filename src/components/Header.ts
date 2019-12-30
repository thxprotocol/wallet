import { Component, Prop, Vue } from 'vue-property-decorator';
import ProfilePicture from '../components/ProfilePicture.vue';
import { Network } from '../models/Network';
import { Account } from '../models/Account';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';

@Component({
    name: 'Header',
    components: {
        ProfilePicture,
    },
})
export default class Header extends Vue {
    private $network!: Network;
    private $account!: Account;
    private $events!: EventService;
    private coinService: CoinService = new CoinService();

    public balance: any = {
        eth: 0,
        token: 0,
        tokenRinkeby: 0,
    };

    public created() {
        this.updateBalance();

        this.coinService.init();

        this.$events.listen('event.ExtdevTransfer', async () => {
            this.balance.token = await this.$account.getExtdevCoinBalance();
        });

        this.$events.listen('event.RinkebyTransfer', async () => {
            this.balance.tokenRinkeby = await this.$account.getRinkebyCoinBalance();
        });
    }

    public async updateBalance() {
        if (this.$network.rinkeby && this.$network.extdev) {
            this.balance.tokenRinkeby = await this.$account.getRinkebyCoinBalance();
            this.balance.token = await this.$account.getExtdevCoinBalance();
            this.balance.eth = await this.$account.getEthBalance();
        }
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
