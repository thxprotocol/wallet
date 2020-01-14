import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

@Component({
    name: 'CRewardRule',
    components: {
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
        poll: {
            proposal: 0,
        },
    };
    private $network!: Network;
    private poolService: PoolService = new PoolService();

    @Prop() private rule!: RewardRule;
    @Prop() private pool!: RewardPool;
    @Prop() private isMember!: boolean;
    @Prop() private isManager!: boolean;

    public async created() {
        this.now = await this.$network.now();
    }

    public async startRulePoll() {
        this.loading = true;
        this.poolService.addRewardRulePoll(
            this.rule,
            this.pool,
            new BN(this.input.poll.proposal).mul(TOKEN_MULTIPLIER),
            )
            .then(() => {
                this.input.proposal = 0;
                this.loading = false;

                (this.$refs.modalCreateRulePoll as BModal).hide();
            })
            .catch((err: string) => {
                this.loading = false;
                console.error(err);
            });
    }

    public async vote(agree: boolean) {
        this.loading = true;
        this.poolService.voteForRule(
            this.rule,
            this.pool,
            agree,
            )
            .then((poll: RewardRulePoll) => {
                this.rule.poll = poll;
                this.loading = false;
            })
            .catch((err: string) => {
                this.error = err;
                this.loading = false;
            });
    }

    public async tryToFinalize() {
        this.loading = true;

        this.poolService.tryToFinalize(
            this.rule,
            this.pool,
            )
            .then((poll: RewardRulePoll) => {
                this.rule.poll = poll;
                this.loading = false;

                (this.$refs.modalCreateRulePoll as BModal).hide();
            })
            .catch((err: string) => {
                this.error = err;
                this.loading = false;
            });
    }

    // public async revokeVote() {
    //     this.loading = true;
    //
    //     return await this.contract.methods.revokeVoteForRule(this.poll.id)
    //         .send({from: this.account.loom.address })
    //         .then(async (tx: any) => {
    //             this.poll = await this.getRulePoll();
    //
    //             // eslint-disable-next-line
    //             console.log(tx);
    //         })
    //         .catch(async (err: string) => {
    //             this.alert.noVote = true;
    //             this.loading = false;
    //             // eslint-disable-next-line
    //             console.error(err);
    //         });
    // }
}
