import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import { BCard, BCardText, BSpinner, BModal } from 'bootstrap-vue';
import { Account } from '@/models/Account';
import { Network } from '@/models/Network';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import BN from 'bn.js';
import { mapGetters } from 'vuex';
import { IRewardPools, RewardPool } from '@/models/RewardPool';
import EventService from '@/services/EventService';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'pools',
    components: {
        'b-modal': BModal,
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
    public loading: any = true;
    public input: any = {
        poolAddress: '',
    };
    private $account!: Account;
    private $network!: Network;
    private poolService!: PoolService;
    private coinService!: CoinService;
    private eventService!: EventService;
    private pools: IRewardPools = {};

    public async created() {
        this.eventService = new EventService();
        this.coinService = new CoinService();
        this.poolService = new PoolService();

        this.poolService.subscribeRewardPools();

        try {
            const pools = await this.poolService.getMyRewardPools();

            for (const address in pools) {
                if (pools[address]) {
                    const balance = await this.coinService.getExtdevBalance(address);
                    pools[address].setBalance(balance);

                    this.$store.commit('addRewardPool', pools[address]);
                }
            }

            this.loading = false;
        } catch (error) {
            this.loading = false;
            this.error = `Oops! Your Reward Pools could not be loaded. Did you provide your keys?`;
        }
    }

    public onJoinRewardPool() {
        this.loading = true;

        this.poolService.joinRewardPool(this.input.poolAddress)
            .then(() => {
                this.loading = false;
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }

    public async onLeavePool(poolAddress: string) {
        this.loading = true;

        firebase.database().ref(`users/${this.$account.uid}/pools`).child(poolAddress)
            .remove()
            .then(() => {
                this.$store.commit('removeRewardPool', poolAddress);

                this.loading = false;
            })
            .catch((err: string) => {
                this.loading = false;
                this.error = err;
            });
    }

    private async updateBalance(address: string) {
        const balance = await this.coinService.getExtdevBalance(address);
        this.pools[address].setBalance(balance);
    }
}
