import BN from 'bn.js';

const RULE_STATE = ['Active', 'Disabled'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class RewardRule {
    public id: number;
    public state: string;
    public created: string;
    public amount: BN;
    public pollAddress: string;

    public title: string = '';
    public description: string = '';

    constructor(data: any, meta: any) {
        this.id = parseInt(data.id, 10);
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.created = data.created;
        this.pollAddress = data.poll;
        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER);

        if (meta) {
            this.title = meta.title;
            this.description = meta.description;
        }
    }
}

export class RewardRulePoll {
    public address: string;
    public contract: any;
    public owner: string;
    public proposedAmount!: BN;
    public startTime!: number;
    public endTime!: number;
    public yesCounter!: number;
    public noCounter!: number;
    public totalVoted!: number;
    public hasVoted!: boolean;
    public vote!: Vote;
    public loading: boolean = true;

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        this.address = address;
        this.contract = contract;
        this.owner = owner;
    }

    public async update() {
        this.loading = true;

        const startTime = await this.contract.methods.startTime().call({ from: this.owner });
        const endTime = await this.contract.methods.endTime().call({ from: this.owner });
        const proposedAmount = await this.contract.methods.proposedAmount().call({ from: this.owner });
        const yesCounter = await this.contract.methods.yesCounter().call({ from: this.owner });
        const noCounter = await this.contract.methods.noCounter().call({ from: this.owner });
        const totalVoted = await this.contract.methods.totalVoted().call({ from: this.owner });
        const voteByAddress = await this.contract.methods.votesByAddress(this.owner).call({ from: this.owner });

        this.startTime = parseInt(startTime, 10);
        this.endTime = parseInt(endTime, 10);
        this.proposedAmount = new BN(proposedAmount).div(TOKEN_MULTIPLIER);
        this.yesCounter = parseInt(new BN(yesCounter).div(TOKEN_MULTIPLIER).toString(), 10);
        this.noCounter = parseInt(new BN(noCounter).div(TOKEN_MULTIPLIER).toString(), 10);
        this.totalVoted = parseInt(totalVoted, 10);
        this.vote = new Vote(voteByAddress);
        this.hasVoted = (this.vote.time !== 0);

        this.loading = false;
    }
}

export class Vote {
    public time!: number;
    public weight!: number;
    public agree!: boolean;

    constructor(data: any) {
        this.time = parseInt(data.time, 10);
        this.weight = parseInt(data.weight, 10);
        this.agree = data.agree;
    }
}
