import { Component, Prop, Vue } from 'vue-property-decorator';
import { BCard, BCardText, BSpinner, BProgress, BProgressBar, BRow, BCol, BOverlay } from 'bootstrap-vue';
import { RewardRule } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import ModalRewardGive from '@/components/modals/ModalRewardGive.vue';
import ModalRewardClaim from '@/components/modals/ModalRewardClaim.vue';
import ModalRulePollCreate from '@/components/modals/ModalRulePollCreate.vue';
import BasePoll from '@/components/BasePoll.vue';

@Component({
    name: 'CRewardRule',
    timers: {
        update: {
            time: 5000,
            repeat: true,
            autostart: false,
        },
    },
    components: {
        'b-overlay': BOverlay,
        'b-col': BCol,
        'b-row': BRow,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'base-poll': BasePoll,
        'modal-reward-give': ModalRewardGive,
        'modal-reward-claim': ModalRewardClaim,
        'modal-rule-poll-create': ModalRulePollCreate,
    },
})
export default class CRewardRule extends Vue {
    private error: string = '';
    private now: number = Math.floor(new Date().getTime() / 1000);
    private showDetails: boolean = true;

    @Prop() private rule!: RewardRule;
    @Prop() private pool!: RewardPool;

    private async created() {
        if (this.rule.hasPollAddress) {
            const poll = await this.pool.getRewardRulePoll(this.rule);

            this.rule.setPoll(poll);
        }
    }

    private async update() {
        this.now = await this.$network.now();

        if (this.rule.poll) {
            await this.rule.poll.updateBasePoll();

            if (this.now > this.rule.poll.endTime) {
                this.$timer.stop('update');
            }
        }
    }

    private async vote(agree: boolean) {
        if (this.rule.poll) {
            this.rule.poll.loading = true;
            this.pool
                .voteForRule(this.rule, agree)
                .then(async (tx: any) => {
                    this.update();
                })
                .catch((err: string) => {
                    this.error = err;
                    if (this.rule.poll) {
                        this.rule.poll.loading = false;
                    }
                });
        }
    }

    private async revokeVote() {
        if (this.rule.poll) {
            this.rule.poll.loading = true;
            this.pool
                .revokeVoteForRule(this.rule)
                .then(async (tx: any) => {
                    this.update();
                })
                .catch((err: string) => {
                    this.error = err;
                    if (this.rule.poll) {
                        this.rule.poll.loading = false;
                    }
                });
        }
    }

    private async tryToFinalize() {
        if (this.rule.poll) {
            this.rule.poll.loading = true;
            this.pool.tryToFinalize(this.rule.poll).catch((err: string) => {
                this.error = err;
                if (this.rule.poll) {
                    this.rule.poll.loading = false;
                }
            });
        }
    }
}
