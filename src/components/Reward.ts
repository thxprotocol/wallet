import { Component, Prop, Vue } from 'vue-property-decorator';
import { BProgress, BSpinner, BCardText, BCard, BModal, BProgressBar } from 'bootstrap-vue';
import { Reward } from '@/models/Reward';
import { RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';

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
    public loading: boolean = true;
    public disabled: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    public input: any = {
        poll: {
            proposal: 0,
        },
    };
    private showDetails: boolean = false;

    @Prop() private reward!: Reward;
    @Prop() private pool!: RewardPool;

    public async created() {
        await this.reward.update();
        this.showDetails = (this.reward.state === 'Pending' || this.reward.state === 'Approved');
        this.loading = false;
    }

    public async update() {
        this.disabled = true;
        await this.reward.update();
        this.now = await this.$network.now();
        this.disabled = false;
    }

    get canWithdraw() {
        return (this.reward.yesCounter > this.reward.noCounter) &&
            (this.reward.beneficiaryAddress.toLowerCase() === this.$network.extdev.account.toLowerCase()) &&
            (this.reward.state === 'Pending' || this.reward.state === 'Approved');
    }

    public async withdraw() {
        this.disabled = true;
        try {
            await this.pool.tryToFinalizeRewardPoll(this.reward);
            await this.pool.withdraw(this.reward);

            this.update();
        } catch (err) {
            this.error = err;
        }
    }

    public vote(agree: boolean) {
        this.disabled = true;
        this.pool.voteForReward(this.reward, agree)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public revokeVote() {
        this.disabled = true;
        this.pool.revokeVoteForReward(this.reward)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    public tryToFinalize() {
        this.disabled = true;
        this.pool.tryToFinalizeRewardPoll(this.reward)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
