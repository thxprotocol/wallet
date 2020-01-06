export class RewardPool {
    public address: string = '';
    public name: string = '';
    public balance: number = 0;
    public outOfSync: boolean = true;

    public contract: any;

    private owner: string = '';
    private _events: string[] = [
        'Deposited',
        'ManagerAdded',
        'ManagerRemoved',
        'MemberAdded',
        'MemberRemoved',
        'RulePollCreated',
        'RulePollFinished',
        'RuleStateChanged',
        'Withdrawn',
    ];

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        this.address = address;
        this.contract = contract;
        this.owner = owner;

        this.contract.methods.name().call({ from: owner })
            .then((name: string) => {
                this.name = name;
            });

        for (const event of this._events) {
            this.contract.events[event]()
                .on('data', async (event: any) => {
                    console.log(event);
                });
        }
    }

    public setBalance(amount: number) {
        this.balance = amount;
    }

    public setOutOfSync(state: boolean) {
        this.outOfSync = state;
    }

    public async isManager(address: string) {
        return await this.contract.methods.isManager(address).call({
            from: this.owner,
        });
    }

    public async isMember(address: string) {
        return await this.contract.methods.isMember(address).call({
            from: this.owner,
        });
    }

    public async addManager(address: string) {
        return await this.contract.methods.addManager(address)
            .send({
                from: this.owner,
            });
    }

    public async addMember(address: string) {
        return await this.contract.methods.addManager(address)
            .send({
                from: this.owner,
            });
    }

    public async createReward(ruleId: number) {
        return await this.contract.methods.createReward(ruleId)
            .send({
                from: this.owner,
            });
    }

    public async withdrawelsOf(address: string) {
        return await this.contract.methods.withdrawelOf(address)
            .send({
                from: this.owner,
            });
    }

}

export interface IRewardPools {
    [address: string]: RewardPool;
}
