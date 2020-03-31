import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BCard, BCardText, BSpinner, BProgress, BProgressBar, BRow, BCol, BOverlay } from 'bootstrap-vue';
import NetworkService from '@/services/NetworkService';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'CRewardRule',
    components: {
        'b-overlay': BOverlay,
        'b-col': BCol,
        'b-row': BRow,
        'b-modal': BModal,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-spinner': BSpinner,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
    },
})
export default class CRewardRule extends Vue {
    public loading: boolean = false;
    public error: string = '';
    public now: number = Math.floor(new Date().getTime() / 1000);
    public input: any = {
        reward: {
            beneficiary: '',
            rule: null,
        },
        poll: {
            proposal: 0,
        },
    };
    public poll: RewardRulePoll | null = null;
    private showDetails: boolean = true;
    private $network!: NetworkService;

    @Prop() private rule!: RewardRule;
    @Prop() private pool!: RewardPool;

    public async created() {
        this.input.reward.beneficiary = this.$network.extdev.account;

        if (this.rule.hasPollAddress) {
            this.poll = await this.pool.getRewardRulePoll(this.rule);
            this.update();
        }
    }

    public async update() {
        if (this.poll) {
            this.poll.update();
        }
        this.now = await this.$network.now();
    }

    public async startRulePoll() {
        this.loading = true;
        this.pool.addRewardRulePoll(
            this.rule,
            new BN(this.input.poll.proposal).mul(TOKEN_MULTIPLIER),
            )
            .then(async (tx: any) => {
                const rule: RewardRule = await this.pool.getRewardRule(this.rule.id);

                this.rule.pollAddress = rule.pollAddress;
                this.poll = await this.pool.getRewardRulePoll(rule);
                this.loading = false;
                this.input.proposal = 0;

                (this.$refs.modalCreateRulePoll as BModal).hide();
            })
            .catch((err: string) => {
                console.error(err);
                this.error = err;
            });
    }

    public async vote(agree: boolean) {
        if (this.poll) {
            this.poll.loading = true;
            this.pool.voteForRule(
                this.rule,
                agree,
                )
                .then(async (tx: any) => {
                    if (this.poll) {
                        this.poll.update();
                    }
                })
                .catch((err: string) => {
                    this.error = err;

                    if (this.poll) {
                        this.poll.loading = false;
                    }
                });
        }
    }

    public async revokeVote() {
        if (this.poll) {
            this.poll.loading = true;
            this.pool.revokeVoteForRule(
                this.rule,
                )
                .then(async (tx: any) => {
                    if (this.poll) {
                        this.poll.update();
                    }
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                });
        }
    }

    public async tryToFinalize() {
        this.loading = true;
        if (this.poll) {
            this.pool.tryToFinalize(
                this.poll,
                )
                .then(async (tx: any) => {
                    this.rule = await this.pool.getRewardRule(
                        this.rule.id,
                    );
                    this.loading = false;
                })
                .catch((err: string) => {
                    console.error(err);
                    this.error = err;
                    this.loading = false;
                });
        }
    }

    private async createReward(id: number, beneficiary: string) {
        this.loading = true;
        await this.pool.createReward(id, beneficiary);
        this.loading = false;
        (this.$refs.modalCreateReward as BModal).hide();
    }
}
