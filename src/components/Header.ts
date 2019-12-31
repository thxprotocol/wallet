import { Component, Vue } from 'vue-property-decorator';
import ProfilePicture from '../components/ProfilePicture.vue';
import { Network } from '../models/Network';
import { Account } from '../models/Account';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import { mapGetters } from 'vuex';
import store from '../store';

@Component({
    name: 'Header',
    components: {
        'profile-picture': ProfilePicture,
    },
    computed: {
        ...mapGetters({
            ethRinkebyBalance: 'ethRinkebyBalance',
            tokenRinkebyBalance: 'tokenRinkebyBalance',
            tokenBalance: 'tokenBalance',
        })
    }
})
export default class Header extends Vue {
    private $network!: Network;
    private $account!: Account;
    private $events!: EventService;
    private coinService!: CoinService;

    public $store: any = store;

    public created() {
        this.updateBalance();

        this.coinService = new CoinService();
        this.coinService.init();
    }

    public async updateBalance() {
        if (this.$account) {
            this.$store.commit('updateBalance', {
                type: 'tokenRinkeby',
                balance: await this.$account.getRinkebyCoinBalance(),
            });

            this.$store.commit('updateBalance', {
                type: 'token',
                balance: await this.$account.getExtdevCoinBalance(),
            });

            this.$store.commit('updateBalance', {
                type: 'eth',
                balance: await this.$account.getEthBalance(),
            });
        }
    }

    public goToAccount() {
        this.$router.replace('/account');
    }
}
