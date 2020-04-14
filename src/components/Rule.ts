import { Component, Prop, Vue } from 'vue-property-decorator';
import { BCard, BCardText, BSpinner, BProgress, BProgressBar, BRow, BCol, BOverlay } from 'bootstrap-vue';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import ModalRewardGive from '@/components/modals/ModalRewardGive.vue';
import ModalRewardClaim from '@/components/modals/ModalRewardClaim.vue';
import ModalRulePollCreate from '@/components/modals/ModalRulePollCreate.vue';

@Component({
    name: 'CRewardRule',
    components: {
        'b-overlay': BOverlay,
        'b-col': BCol,
        'b-row': BRow,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'modal-reward-give': ModalRewardGive,
        'modal-reward-claim': ModalRewardClaim,
        'modal-rule-poll-create': ModalRulePollCreate,
    },
})
export default class CRewardRule extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    private showDetails: boolean = true;

    @Prop() private rule!: RewardRule;
    @Prop() private pool!: RewardPool;

    private mounted() {
        this.update();
    }

    private async update() {
        this.loading = true;
        if (this.rule.hasPollAddress) {
            const poll = await this.pool.getRewardRulePoll(this.rule);

            this.rule.setPoll(poll);
        }

        this.now = await this.$network.now();
        this.loading = false;
    }

    private async vote(agree: boolean) {
        if (this.rule.poll) {
            this.loading = true;
            this.pool
                .voteForRule(this.rule, agree)
                .then(async (tx: any) => {
                    if (this.rule.poll) {
                        this.rule.poll.update();
                    }
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                    this.loading = false;
                });
        }
    }

    private async revokeVote() {
        if (this.rule.poll) {
            this.loading = true;
            this.pool
                .revokeVoteForRule(this.rule)
                .then(async (tx: any) => {
                    if (this.rule.poll) {
                        this.rule.poll.update();
                    }
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                    this.loading = false;
                });
        }
    }

    private async tryToFinalize() {
        this.loading = true;
        if (this.rule.poll) {
            this.pool
                .tryToFinalize(this.rule.poll)
                .then(async (tx: any) => {
                    this.loading = false;
                })
                .catch((err: string) => {
                    this.error = err;
                    this.loading = false;
                });
        }
    }
}
