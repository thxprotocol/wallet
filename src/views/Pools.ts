import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import Modal from '@/components/Modal.vue';
import { BCard, BCardText, BSpinner } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import BN from 'bn.js';
import { mapGetters } from 'vuex';
import { IRewardPools, RewardPool } from '@/models/RewardPool';

const coinMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'pools',
    components: {
        'modal': Modal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
    },
})
export default class Pools extends Vue {
    public error: string = '';
    public loading: any = false;
    public showJoinPoolModal: any = false;
    public input: any = {
        poolAddress: '',
    };
    private $account!: Account;
    private $network!: Network;
    private poolService!: PoolService;
    private coinService!: CoinService;

    public created() {
        this.coinService = new CoinService();

        this.poolService = new PoolService();
        this.poolService.init();

        this.loading = true;

        this.poolService.getMyRewardPools()
            .then(async (pools: RewardPool[]) => {

                for (const pool of pools) {
                    const balance = await this.coinService.getExtdevBalance(pool.address);

                    pool.setBalance(balance);

                    this.$store.commit('addRewardPool', pool);
                }

                this.loading = false;
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
                this.error = err;
            });
    }

    public onLeavePool(poolAddress: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(poolAddress).remove();
    }

    public openPool(poolAddress: string) {
        return this.$router.replace(`/pools/${poolAddress}`);
    }
}
