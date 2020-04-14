import firebase from 'firebase/app';
import 'firebase/database';
import { Component, Vue } from 'vue-property-decorator';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import CoinService from './services/CoinService';
import PoolService from './services/PoolService';
import { Account } from '@/models/Account';
import store from './store';
import { mapGetters } from 'vuex';
import { RewardPool } from '@/models/RewardPool';
import { Notification } from '@/models/Notification';

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
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();
    private userRef!: firebase.database.Reference;

    public async created() {
        firebase.auth().onAuthStateChanged((user: firebase.User | any) => {
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
                        const pool: RewardPool = await this.poolService.getRewardPool(s.key);
                        const notificationRef = firebase.database().ref(`pools/${pool.address}/notifications`);

                        this.$store.commit('addRewardPool', pool);

                        notificationRef.on('child_added', async (snap: any) => {
                            const address = snap.val().address;
                            const member = await this.$users.getMemberByAddress(address);
                            const account: Account = new Account(member.uid);
                            const notification: Notification = new Notification(
                                pool,
                                address,
                                snap.key,
                                account,
                                snap.val(),
                            );

                            this.$store.commit('setNotification', notification);
                        });
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

        this.$store.commit('updateBalance', { type: 'eth', balance: ethBalance });
        this.$store.commit('updateBalance', { type: 'token', balance: extdevBalance });
        this.$store.commit('updateBalance', { type: 'tokenRinkeby', balance: rinkebyBalance });
    }
}
