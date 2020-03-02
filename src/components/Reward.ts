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
    public disabled: boolean = false;
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

    public mounted() {
        this.loading = true;
        this.update();
        this.loading = false;
    }

    public async update() {
        this.disabled = true;
        await this.reward.update();
        this.now = await this.$network.now();
        this.disabled = false;
    }

    get canWithdraw() {
        return this.reward.beneficiaryAddress.toLowerCase() === this.$network.extdev.account.toLowerCase();
    }

    public async withdraw() {
        this.disabled = true;
        try {
            await this.poolService.tryToFinalizeRewardPoll(this.reward, this.pool);
            await this.poolService.withdraw(this.reward, this.pool);

            this.update();
        } catch (err) {
            this.error = err;
        }
    }

    public vote(agree: boolean) {
        this.disabled = true;
        this.poolService.voteForReward(this.reward, this.pool, agree)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public revokeVote() {
        this.disabled = true;
        this.poolService.revokeVoteForReward(this.reward, this.pool)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public tryToFinalize() {
        this.disabled = true;
        this.poolService.tryToFinalizeRewardPoll(this.reward, this.pool)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
