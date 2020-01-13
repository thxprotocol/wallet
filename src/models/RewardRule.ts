const RuleState = ['Active', 'Disabled'];

export class RewardRulePoll {
    public address: string;
    public contract: any;
    public owner: string;

    public startTime!: number;
    public endTime!: number;
    public now!: number;
    public yesCounter!: number;
    public noCounter!: number;

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        this.address = address;
        this.contract = contract;
        this.owner = owner;

        this.contract.methods.endTime().call({ from: owner })
            .then(this.startTime);

        this.contract.methods.endTime().call({ from: owner })
            .then(this.endTime);
    }
}

export class RewardRule {
    public id: number;
    public state: string;
    public created: string;
    public amount: number;
    public poll!: RewardRulePoll;
    public pollAddress: string;

    public title: string = '';
    public description: string = '';

    constructor(data: any, meta: any) {
        this.id = parseInt(data.id, 10);
        this.state = RuleState[parseInt(data.state, 10)];
        this.created = data.created;
        this.pollAddress = data.poll;
        this.amount = data.amount;

        if (meta) {
            this.title = meta.title;
            this.description = meta.description;
        }
    }
}
