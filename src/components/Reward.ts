import { Component, Prop, Vue } from 'vue-property-decorator';
import { BProgress, BSpinner, BCardText, BCard, BModal, BProgressBar } from 'bootstrap-vue';
import { Reward } from '@/models/Reward';
import { RewardPool } from '@/models/RewardPool';
import ProfilePicture from '@/components/ProfilePicture.vue';
import BasePoll from '@/components/BasePoll.vue';

@Component({
    name: 'CReward',
    timers: {
        update: { 
            time: 5000, 
            repeat: true,
            autostart: false,
        }
    },
    components: {
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'profile-picture': ProfilePicture,
        'base-poll': BasePoll,
    },
})
export default class CReward extends Vue {
    private loading: boolean = true;
    private disabled: boolean = false;
    private error: string = '';
    private now: number = Math.floor(new Date().getTime() / 1000);
    private input: any = {
        poll: {
            proposal: 0,
        },
    };
    private showDetails: boolean = false;
    private $timer!: any;
    
    @Prop() private reward!: Reward;
    @Prop() private pool!: RewardPool;

    public async created() {
        await this.reward.update();
        
        this.loading = false;
        this.showDetails = this.reward.state === 'Pending' || this.reward.state === 'Approved';
        this.now = await this.$network.now();
    }

    private async update() {
        this.now = await this.$network.now();
        
        await this.reward.update();
        
        if (this.now > this.reward.endTime) {
            this.$timer.stop('update');
        }
        this.disabled = false;
    }

    get canWithdraw() {
        return (
            this.reward.yesCounter > this.reward.noCounter &&
            this.reward.beneficiaryAddress.toLowerCase() === this.$network.extdev.account.toLowerCase() &&
            (this.reward.state === 'Pending' || this.reward.state === 'Approved')
        );
    }

    private async withdraw() {
        this.disabled = true;
        try {
            await this.pool.tryToFinalizeRewardPoll(this.reward);
            await this.pool.withdraw(this.reward);

            this.update();
        } catch (err) {
            this.error = err;
        }
    }

    private vote(agree: boolean) {
        this.disabled = true;
        this.pool
            .voteForReward(this.reward, agree)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    private revokeVote() {
        this.disabled = true;
        this.pool
            .revokeVoteForReward(this.reward)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }

    private tryToFinalize() {
        this.disabled = true;
        this.pool
            .tryToFinalizeRewardPoll(this.reward)
            .then((tx: any) => {
                this.update();
            })
            .catch((err: string) => {
                this.error = err;
            });
    }
}
