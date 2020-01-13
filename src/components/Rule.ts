import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import { BModal, BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import { RewardPool } from '@/models/RewardPool';
import PoolDetail from '@/views/Pool';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

@Component({
    name: 'CRewardRule',
    components: {
        'b-modal': BModal,
        BCard,
        BCardText,
        BSpinner,
        BProgress,
        BProgressBar,
    },
})
export default class CRewardRule extends Vue {
    public $parent!: PoolDetail;
    public loading: boolean = false;
    public error: string = '';
    public input: any = {
        poll: {
            proposal: 0,
        },
    };
    private $network!: Network;

    @Prop() public rule!: RewardRule;
    @Prop() public pool!: RewardPool;

    @Prop() public isMember!: boolean;
    @Prop() public isManager!: boolean;


    // public async vote(agree: boolean) {
    //     this.loading = true;
    //
    //     return await this.contract.methods.voteForRule(this.poll.id, agree)
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
    //
    //             // eslint-disable-next-line
    //             console.error(err);
    //         });
    // }
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
    // public async finalizePoll() {
    //     const rulePoll = await this.$network.getExtdevContract(
    //         this.$network.extdev.web3js,
    //         RulePoll,
    //         this.rule.poll,
    //     );
    //
    //     this.loading = true;
    //
    //     return await rulePoll.methods.tryToFinalize()
    //         .send({ from: this.account.loom.address })
    //         .then(async (tx: any) => {
    //             this.loading = false;
    //             this.modal.rulePoll = false;
    //             this.rule.poll = '0x0000000000000000000000000000000000000000';
    //
    //             // eslint-disable-next-line
    //             console.log(tx);
    //         })
    //         .then((err: string) => {
    //             this.loading = false;
    //             // eslint-disable-next-line
    //             console.error(err);
    //         });
    // }

    public async startRulePoll() {
        this.loading = true;

        return await this.pool.startRulePoll(
                this.rule.id,
                new BN(this.input.poll.proposal).mul(tokenMultiplier),
            )
            .then(async (tx: any) => {
                this.input.proposal = 0;
                this.loading = false;

                (this.$refs.modalCreateRulePoll as BModal).hide();

                // TODO Handle catching the RulePollCreated event in this tx.
                // Store it in the firebase db
                console.log(tx);
                debugger;
            })
            .catch((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            });
    }
}
