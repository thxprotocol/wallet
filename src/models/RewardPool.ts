import EventService from '@/services/EventService';

export class Transaction {
    public amount: string;
    public created: number;
    public hash: string;
    public variant: string

    constructor(data: any) {
        this.hash = data.hash;
        this.amount = data.amount;
        this.created = parseInt(data.created, 10);
        this.variant = 'info';
    }
}

export class Deposit extends Transaction {
    public sender: string;
    public component: string;

    constructor(data: any) {
        super(data);
        this.sender = data.sender;
        this.variant = 'danger';
        this.component = 'deposit';
    }
}

export class Withdrawel extends Transaction {
    public receiver: string;
    public component: string;

    constructor(data: any) {
        super(data);
        this.receiver = data.receiver;
        this.variant = 'success';
        this.component = 'withdrawel';
    }
}

export class RewardPool {
    public address: string = '';
    public name: string = '';
    public balance: number = 0;
    public outOfSync: boolean = true;
    public contract: any;
    public eventTypes: string[] = [
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
    private owner: string = '';
    private eventService: EventService = new EventService;

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

        for (const event of this.eventTypes) {
            this.contract.events[event]()
                .on('data', (e: any) => {
                    this.eventService.dispatch(`event.${e.event}`, e.returnValues);
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

    public async depositsOf(address: string) {
        const length = await this.contract.methods.countDeposits(address).call({
            from: this.owner,
        });
        let deposits: Deposit[] = [];

        for (let i = 0; i < length; i++) {
            const d = await this.contract.methods.deposits(address, i)
                .call({
                    from: this.owner,
                });
            deposits.push(new Deposit(d));
        }

        return deposits;
    }

    public async withdrawelsOf(address: string) {
        const length = await this.contract.methods.countWithdrawels(address).call({
            from: this.owner,
        });
        let withdrawels: Withdrawel[] = [];

        for (let i = 0; i < length; i++) {
            const w = await this.contract.methods.withdrawels(address, i)
                .call({
                    from: this.owner,
                });
            withdrawels.push(new Withdrawel(w));
        }

        return withdrawels;
    }

}

export interface IRewardPools {
    [address: string]: RewardPool;
}

export interface IRewardPool {
    address: string;
    name: string;
    balance: number;
    outOfSync: boolean;
    contract: any;
    owner: string;
    eventService: EventService;
    _events: string[];
}
