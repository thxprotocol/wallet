import firebase from 'firebase/app';
import 'firebase/database';
import { Component, Vue } from 'vue-property-decorator';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import CoinService from './services/CoinService';
import PoolService from './services/PoolService';
import { Account } from '@/models/Account';
import { mapGetters } from 'vuex';
import { RewardPool } from '@/models/RewardPool';
import { Notification } from '@/models/Notification';
import _ from 'lodash';

@Component({
    name: 'App',
    components: {
        Header,
        Footer,
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

                window.addEventListener('focus', this.setOnline);

                if (this.$network.extdev) {
                    const poolRef = firebase.database().ref(`users/${user.uid}/pools`);

                    this.getBalances();

                    this.coinService.listen();

                    this.userRef.child('notifications').on('child_added', async (s: any) => {
                        const isRemoved = s.val().removed;
                        if (!isRemoved) {
                            const pool: RewardPool = await this.poolService.getRewardPool(s.val().pool);
                            const snap = await firebase
                                .database()
                                .ref(`pools/${pool.address}/notifications/${s.key}`)
                                .once('value');

                            this.addNotification(pool, snap, isRemoved);
                        }
                    });

                    this.userRef.child('notifications').on('child_changed', async (snap: any) => {
                        if (snap.val().removed) {
                            this.$store.commit('deleteNotification', snap.key);
                        }
                    });

                    poolRef.on('child_added', async (s: any) => {
                        const pool: RewardPool = await this.poolService.getRewardPool(s.key);

                        await pool.checkMemberships();

                        if (pool.isMember) {
                            firebase.database().ref(`/pools/${s.key}/members/${user.uid}`).update({ uid: user.uid });
                        }

                        if (pool.isManager) {
                            firebase.database().ref(`/pools/${s.key}/managers/${user.uid}`).update({ uid: user.uid });
                        }

                        this.$store.commit('addRewardPool', pool);
                    });

                    poolRef.on('child_removed', async (s: any) => {
                        const pool = await this.poolService.getRewardPool(s.key);

                        await pool.checkMemberships();

                        firebase.database().ref(`/pools/${s.key}/members/${user.uid}`).remove();
                        firebase.database().ref(`/pools/${s.key}/managers/${user.uid}`).remove();

                        this.$store.commit('removeRewardPool', pool);
                    });
                }
            } else {
                window.removeEventListener('focus', this.setOnline);
            }
        });
    }

    private async addNotification(pool: RewardPool, snap: any, removed: boolean) {
        const address = snap.val().address;
        const member = await this.$users.getMemberByAddress(address);
        const account: Account = new Account(member.uid);
        const notification: Notification = new Notification(pool, address, snap.key, account, removed, snap.val());

        this.$store.commit('setNotification', notification);
    }

    private setOnline() {
        return this.userRef.child('online').set(true);
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
