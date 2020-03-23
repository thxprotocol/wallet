import firebase from 'firebase/app';
import 'firebase/database';
import { Component, Vue } from 'vue-property-decorator';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import CoinService from './services/CoinService';
import PoolService from './services/PoolService';
import EventService from './services/EventService';
import { Account } from '@/models/Account';
import store from './store';
import NetworkService from './services/NetworkService';
import { mapGetters } from 'vuex';

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
    },
    computed: {
        ...mapGetters({
            account: 'account',
        }),
    },
})
export default class App extends Vue {
    public $store: any = store;
    public $events!: EventService;

    private currentUser: firebase.User | any;
    private $network!: NetworkService;
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();
    private account!: Account;

    public async created() {
        this.currentUser = firebase.auth().currentUser;

        if (this.currentUser) {
            this.getAccount(this.currentUser.uid);

            if (this.$network.extdev) {
                this.joinLatestRewardPool();
                this.getBalances();

                this.coinService.listen();

                firebase.database().ref(`users/${this.currentUser.uid}/pools`)
                    .on('child_added', async (s: any) => {
                        const pool = await this.poolService.getRewardPool(s.key);

                        this.$store.commit('addRewardPool', pool);
                    });

                firebase.database().ref(`users/${this.currentUser.uid}/pools`)
                    .on('child_removed', async (s: any) => {
                        const pool = await this.poolService.getRewardPool(s.key);

                        this.$store.commit('removeRewardPool', pool);
                    });

                firebase.database().ref(`users/${this.currentUser.uid}`)
                    .on('child_added', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: s.val() });
                    });

                firebase.database().ref(`users/${this.currentUser.uid}`)
                    .on('child_changed', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: s.val() });
                    });

                firebase.database().ref(`users/${this.currentUser.uid}`)
                    .on('child_removed', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: null });
                    });
            }
        }
    }

    private async joinLatestRewardPool() {
        const contractAddress = await this.poolService.getRewardPoolAddress();
        const snap = await firebase.database().ref(`users/${this.currentUser.uid}/pools`).once('value');

        if (!snap.val() || !snap.val()[contractAddress]) {
            this.poolService.join(this.currentUser.uid, contractAddress);
        }
    }

    private getAccount(uid: string) {
        const account = new Account(uid);

        this.$store.commit('addAccount', account);

        window.onblur = () => this.account.setOnline(false);
        window.onfocus = () => this.account.setOnline(true);
    }

    private async getBalances() {
        const extdevBalance = await this.coinService.getExtdevBalance(this.$network.extdev.account);
        const rinkebyBalance = await this.coinService.getRinkebyBalance(this.$network.rinkeby.account.address);
        const ethBalance = await this.coinService.getEthBalance(this.$network.rinkeby.account.address);

        this.$store.commit('updateBalance', {type: 'eth', balance: ethBalance});
        this.$store.commit('updateBalance', {type: 'token', balance: extdevBalance});
        this.$store.commit('updateBalance', {type: 'tokenRinkeby', balance: rinkebyBalance});
    }
}
