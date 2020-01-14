const RULE_STATE = ['Active', 'Disabled'];

export class RewardRulePoll {
    public address: string;
    public contract: any;
    public owner: string;

    public proposedAmount!: number;
    public startTime!: number;
    public endTime!: number;
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

        this.contract.methods.startTime()
            .call({ from: owner })
            .then((r: string) => {
                this.startTime = parseInt(r, 10);
            });

        this.contract.methods.endTime()
            .call({ from: owner })
            .then((r: string) => {
                this.endTime = parseInt(r, 10);
            });

        this.contract.methods.yesCounter()
            .call({ from: owner })
            .then((r: string) => {
                this.yesCounter = parseInt(r, 10);
            });

        this.contract.methods.noCounter()
            .call({ from: owner })
            .then((r: string) => {
                this.noCounter = parseInt(r, 10);
            });

        this.contract.methods.proposedAmount()
            .call({ from: owner })
            .then((r: string) => {
                this.proposedAmount = parseInt(r, 10);
            });
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
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.created = data.created;
        this.pollAddress = data.poll;
        this.amount = data.amount;

        if (meta) {
            this.title = meta.title;
            this.description = meta.description;
        }
    }
}
