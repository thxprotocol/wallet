import BN from 'bn.js';
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class BasePoll {
    public address: string;
    public contract: any;
    public owner: string;
    public startTime!: number;
    public endTime!: number;
    public yesCounter!: number;
    public noCounter!: number;
    public totalVoted!: number;
    public hasVoted!: boolean;
    public vote!: Vote;
    public loading: boolean = true;
    public finalized!: boolean;

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        this.address = address;
        this.contract = contract;
        this.owner = owner;
    }

    public async updateBasePoll() {
        const startTime = await this.contract.methods.startTime().call({ from: this.owner });
        const endTime = await this.contract.methods.endTime().call({ from: this.owner });
        const yesCounter = await this.contract.methods.yesCounter().call({ from: this.owner });
        const noCounter = await this.contract.methods.noCounter().call({ from: this.owner });
        const totalVoted = await this.contract.methods.totalVoted().call({ from: this.owner });
        const voteByAddress = await this.contract.methods.votesByAddress(this.owner).call({ from: this.owner });
        const finalized = await this.contract.methods.finalized().call({ from: this.owner });

        this.startTime = parseInt(startTime, 10);
        this.endTime = parseInt(endTime, 10);
        this.finalized = finalized;
        this.yesCounter = parseInt(new BN(yesCounter).div(TOKEN_MULTIPLIER).toString(), 10);
        this.noCounter = parseInt(new BN(noCounter).div(TOKEN_MULTIPLIER).toString(), 10);
        this.totalVoted = parseInt(totalVoted, 10);
        this.vote = new Vote(voteByAddress);
        this.hasVoted = (this.vote.time !== 0);
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
