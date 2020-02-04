import { Component, Prop, Vue } from 'vue-property-decorator';
import { BProgress, BSpinner, BCardText, BCard, BModal, BProgressBar } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import { Reward } from '@/models/Reward';
import { RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';
import PoolService from '@/services/PoolService';

@Component({
    name: 'CReward',
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'profile-picture': ProfilePicture,
    },
})
export default class CReward extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    public input: any = {
        poll: {
            proposal: 0,
        },
    };
    private poolService: PoolService = new PoolService();
    private $network!: Network;

    @Prop() private reward!: Reward;
    @Prop() private pool!: RewardPool;
    @Prop() private isManager!: boolean;
    @Prop() private isMember!: boolean;

    public created() {
        this.update();
    }

    public async update() {
        this.reward.update();
        this.now = await this.$network.now();
    }

    get canWithdraw() {
        return this.reward.beneficiaryAddress.toLowerCase() === this.$network.extdev.account.toLowerCase();
    }

    public withdraw() {
        this.reward.loading = true;
        this.poolService.withdraw(this.reward, this.pool)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public vote(agree: boolean) {
        this.reward.loading = true;
        this.poolService.voteForReward(this.reward, this.pool, agree)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public revokeVote() {
        this.reward.loading = true;
        this.poolService.revokeVoteForReward(this.reward, this.pool)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public tryToFinalize() {
        this.reward.loading = true;
        this.poolService.tryToFinalizeRewardPoll(this.reward, this.pool)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
