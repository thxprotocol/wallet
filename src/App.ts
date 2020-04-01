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
    private $user: firebase.User | any;
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();
    private account!: Account;
    private userRef!: firebase.database.Reference;

    public async created() {
        firebase.auth()
            .onAuthStateChanged((user: firebase.User | any) => {
                if (user) {
                    this.userRef = firebase.database().ref(`users/${user.uid}`);

                    this.getAccount(user.uid);

                    window.addEventListener('focus', this.setOnline);

                    this.userRef.on('child_added', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: s.val() });
                    });

                    this.userRef.on('child_changed', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: s.val() });
                    });

                    this.userRef.on('child_removed', (s: any) => {
                        this.$store.commit('updateAccount', { prop: s.key, val: null });
                    });

                    if (this.$network.extdev) {
                        const poolRef = firebase.database().ref(`users/${user.uid}/pools`);

                        this.getBalances();

                        this.coinService.listen();

                        poolRef.on('child_added', async (s: any) => {
                            const pool = await this.poolService.getRewardPool(s.key);

                            this.$store.commit('addRewardPool', pool);
                        });

                        poolRef.on('child_removed', async (s: any) => {
                            const pool = await this.poolService.getRewardPool(s.key);

                            this.$store.commit('removeRewardPool', pool);
                        });
                    }
                } else {
                    window.removeEventListener('focus', this.setOnline);
                }
        });
    }

    private setOnline() {
        return this.userRef.child('online').set(true);
    }

    private getAccount(uid: string) {
        const account = new Account(uid);

        this.$store.commit('addAccount', account);
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
