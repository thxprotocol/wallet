import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/database';
import { BCard, BCardText, BSpinner, BProgress, BProgressBar } from 'bootstrap-vue';

const Modal = require('../components/Modal');
const RulePoll = require('../contracts/RulePoll.json');
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

const THX = window.THX;

@Component({
    name: 'Rule',
    components: {
        Modal,
        BCard,
        BCardText,
        BSpinner,
        BProgress,
        BProgressBar,
    },
})
export default class Rule extends Vue {
    public loading: boolean = false;
    public modal: any = {
        rulePoll: false,
        startPoll: false,
        // finalizePoll: false,
        ruleInfo: false,
    };
    public alert: any = {
        noVote: false,
    };
    public meta: any = {
        title: '',
        description: '',
    };
    public poll: any = null;
    public input: any = {
        proposedAmount: 0,
    };

    @Prop() rule: any = null;
    @Prop() contract: any = null;
    @Prop() account: any = {
        loom: {
            address: ''
        },
        isMember: false,
        isManager: false,
    };

    mounted() {
        this.init();
    }

    async init() {
        this.loading = true;
        this.meta = (await this.getRuleMeta()).val();
        this.loading = false;
    }
    async getRuleMeta() {
        const rulesRef = firebase.database().ref(`pools/${this.contract._address}/rules`);

        return await rulesRef.child(this.rule.slug).once('value');
    }
    async showRulePoll() {
        this.loading = true;
        this.modal.rulePoll = true;
        this.poll = await this.getRulePoll();
    }
    async getRulePoll() {
        if (this.rule.poll !== "0x0000000000000000000000000000000000000000") {
            const utils = THX.network.loom.utils;
            const rulePoll = await THX.network.contract(RulePoll, this.rule.poll);
            const id = parseInt(await rulePoll.methods.id().call());
            const proposedAmount = utils.fromWei(await rulePoll.methods.proposedAmount().call(), 'ether');
            const vote = await rulePoll.methods.votesByAddress(this.account.loom.address).call();
            const minVotedTokensPerc = await this.contract.methods.minVotedTokensPerc().call();
            // const votedTokensPerc = await rulePoll.methods.getVotedTokensPerc().call();
            const yesCounter = await rulePoll.methods.yesCounter().call();
            const noCounter = await rulePoll.methods.noCounter().call();
            const totalVoted = await rulePoll.methods.totalVoted().call();
            const finalized = await rulePoll.methods.finalized().call();
            const startTime = await rulePoll.methods.startTime().call();
            const endTime = await rulePoll.methods.endTime().call();
            const now = (await THX.network.loom.eth.getBlock('latest')).timestamp;
            const diff = (endTime - now);
            const meta = (await this.getRuleMeta()).val();

            this.loading = false;

            return this.poll = {
                id: id,
                amount: this.rule.amount,
                proposedAmount: proposedAmount,
                minVotedTokensPerc: minVotedTokensPerc,
                // votedTokensPerc: votedTokensPerc,
                yesCounter: parseInt(new BN(yesCounter).div(tokenMultiplier)),
                noCounter: parseInt(new BN(noCounter).div(tokenMultiplier)),
                totalVoted: totalVoted,
                hasVoted: parseInt(vote.time) > 0,
                now: now,
                startTime: parseInt(startTime),
                endTime: parseInt(endTime),
                diff: diff,
                address: this.rule.poll,
                finalized: finalized,
                meta: meta,
            }
        }

    }
    async vote(agree: boolean) {
        this.loading = true;

        return await this.contract.methods.voteForRule(this.poll.id, agree)
            .send({from: this.account.loom.address })
            .then(async (tx: any) => {
                this.poll = await this.getRulePoll();

                // eslint-disable-next-line
                console.log(tx);
            })
            .catch(async (err: string) => {
                this.alert.noVote = true;
                this.loading = false;

                // eslint-disable-next-line
                console.error(err);
            });
    }
    async revokeVote() {
        this.loading = true;

        return await this.contract.methods.revokeVoteForRule(this.poll.id)
            .send({from: this.account.loom.address })
            .then(async (tx: any) => {
                this.poll = await this.getRulePoll();

                // eslint-disable-next-line
                console.log(tx);
            })
            .catch(async (err: string) => {
                this.alert.noVote = true;
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            });
    }
    async finalizePoll() {
        const rulePoll = await THX.network.contract(RulePoll, this.rule.poll);

        this.loading = true;

        return await rulePoll.methods.tryToFinalize()
            .send({ from: this.account.loom.address })
            .then(async (tx: any) => {
                this.loading = false;
                this.modal.rulePoll = false;
                this.rule.poll = "0x0000000000000000000000000000000000000000";

                // eslint-disable-next-line
                console.log(tx);
            })
            .then((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            })
    }
    async startPoll() {
        const utils = THX.network.loom.utils;
        const amount = utils.toWei(this.input.proposedAmount, 'ether');

        this.modal.startPoll = false;
        this.loading = true;

        return await this.contract.methods.startRulePoll(this.rule.id, amount)
            .send({ from: this.account.loom.address })
            .then(async (tx: any) => {
                this.input.proposedAmount = 0;
                this.modal.startPoll = false;
                this.poll = await this.getRulePoll();

                // eslint-disable-next-line
                console.log(tx);
            })
            .catch((err: string) => {
                this.loading = false;
                // eslint-disable-next-line
                console.error(err);
            })
    }
}