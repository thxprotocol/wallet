export class RewardRule {

}

export class RewardPool {
    public address: string = '';

    private contract: any;
    private owner: string = '';

    public name: string = '';
    public balance: number = 0;
    public outOfSync: boolean = true;

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
    }

    setBalance(amount: number) {
        this.balance = amount;
    }

    setOutOfSync(state: boolean) {
        this.outOfSync = state;
    }

    async isManager(address: string) {
        return await this.contract.methods.isManager(address).call({
            from: this.owner,
        });
    }

    async isMember(address: string) {
        return await this.contract.methods.isMember(address).call({
            from: this.owner,
        });
    }

    async addManager(address: string) {
        return await this.contract.methods.addManager(address)
            .send({
                from: this.owner,
            });
    }

    async addMember(address: string) {
        return await this.contract.methods.addManager(address)
            .send({
                from: this.owner,
            });
    }


    async createReward(ruleId: number) {
        return await this.contract.methods.createReward(ruleId)
            .send({
                from: this.owner,
            });
    }

}