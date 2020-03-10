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

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
    },
})
export default class App extends Vue {
    public $store: any = store;
    public $events!: EventService;

    private currentUser: firebase.User | any;
    private $network!: NetworkService;
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();

    public created() {
        this.currentUser = firebase.auth().currentUser;

        if (this.currentUser) {
            this.coinService.init();

            this.getBalances();
            this.getMyRewardPools();
            this.getAccount(this.currentUser.uid);

            firebase.database().ref(`users/${this.currentUser.uid}/pools`)
                .on('child_added', (s: any) => {
                    this.addRewardPool(s.key);
                });

            firebase.database().ref(`users/${this.currentUser.uid}/pools`)
                .on('child_removed', (s: any) => {
                    this.removeRewardPool(s.key);
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

    private getAccount(uid: string) {
        this.$store.commit('addAccount', new Account(uid));
    }

    private async getBalances() {
        const extdevBalance = await this.coinService.getExtdevBalance(this.$network.extdev.account);
        const rinkebyBalance = await this.coinService.getRinkebyBalance(this.$network.rinkeby.account.address);
        const ethBalance = await this.coinService.getEthBalance(this.$network.rinkeby.account.address);

        this.$store.commit('updateBalance', {type: 'eth', balance: ethBalance});
        this.$store.commit('updateBalance', {type: 'token', balance: extdevBalance});
        this.$store.commit('updateBalance', {type: 'tokenRinkeby', balance: rinkebyBalance});
    }

    private async getMyRewardPools() {
        const snap: any = await firebase.database().ref(`users/${this.currentUser.uid}/pools`).once('value');
        const utils: any = this.$network.web3js.utils;
        const pools: any = {};

        for (const address in snap.val()) {
            if (snap.val()[address]) {
                if (utils.isAddress(address)) {
                    const pool = await this.poolService.getRewardPool(address);
                    if (pool) {
                        pools[address] = pool;
                    }
                }
            }
        }

        return pools;
    }

    private async addRewardPool(address: string) {
        const pool = await this.poolService.getRewardPool(address);

        this.$store.commit('addRewardPool', pool);
    }

    private async removeRewardPool(address: string) {
        const pool = await this.poolService.getRewardPool(address);

        this.$store.commit('removeRewardPool', pool);
    }
}
