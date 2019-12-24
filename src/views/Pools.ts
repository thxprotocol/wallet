import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import modal from '@/components/Modal.vue';
import { BCard, BCardText, BSpinner } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { RewardPool } from '@/models/RewardPool';

const BN = require('bn.js');
const coinMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'pools',
    components: {
        modal,
        BCard,
        BCardText,
        BSpinner,
    },
})
export default class Pools extends Vue {

    public error: string = '';
    public loading: any = false;
    public pools: any = {};
    public showJoinPoolModal: any = false;
    public input: any = {
        poolAddress: '',
    };
    private $account!: Account;
    private $network!: Network;
    private poolService: PoolService = new PoolService();
    private coinService: CoinService = new CoinService();

    constructor() {
        super();

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                this.poolService.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.loading = false;

                        Vue.set(this.pools, pool.address, pool);
                    });
            });

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_removed', (s: any) => {
                Vue.delete(this.pools, s.key);
            });
    }

    public mounted() {
        this.loading = true;

        (this.poolService as any).getMyRewardPools()
            .then(async (pools: any) => {
                this.pools = pools;
                this.loading = false;

                for (const a in pools) {
                    const pool: RewardPool = pools[a];
                    const balance = await this.coinService.getBalance(pool.address);

                    pool.setBalance(balance);
                }
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = `Oops! Your Reward Pools could not be loaded. Did you provide your keys?`;
            });

    }

    public onJoinRewardPool() {
        this.loading = true;

        return this.poolService.joinRewardPool(this.input.poolAddress)
            .then(() => {
                this.loading = false;
                this.showJoinPoolModal = false;
            })
            .catch((err: string) => {
                console.error(err);
            });
    }

    public onLeavePool(poolAddress: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(poolAddress).remove();
    }

    public openPool(poolAddress: string) {
        return this.$router.replace(`/pools/${poolAddress}`);
    }
}
