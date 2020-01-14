import EventService from '@/services/EventService';
import BN from 'bn.js';

const RULE_STATE = ['Active', 'Disabled'];

export class TransactionEvent {
    public amount: string;
    public created: number;
    public hash: string;
    public variant: string;
    public component: string;
    public blockTime: number;

    constructor(data: any) {
        this.hash = data.hash;
        this.amount = data.amount;
        this.created = parseInt(data.created, 10);
        this.variant = 'info';
        this.component = '';
        this.blockTime = 0;
    }
}

export class DepositEvent extends TransactionEvent {
    public sender: string;
    public component: string;

    constructor(data: any) {
        super(data);
        this.sender = data.sender;
        this.variant = 'danger';
        this.component = 'deposit-event';
    }
}

export class WithdrawelEvent extends TransactionEvent {
    public receiver: string;

    constructor(data: any) {
        super(data);
        this.receiver = data.receiver;
        this.variant = 'success';
        this.component = 'withdrawel-event';
    }
}

export class RuleStateChangedEvent extends TransactionEvent {
    public rule: number;
    public state: string;

    constructor(data: any, blockTime: string) {
        super(data);
        this.rule = parseInt(data.id, 10);
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.blockTime = parseInt(blockTime, 10);
        this.variant = 'success';
        this.component = 'rulestatechanged-event';
    }
}

export class RulePollCreatedEvent extends TransactionEvent {
    public rule: number;
    public proposal: string;

    constructor(data: any, blockTime: string) {
        super(data);
        this.rule = parseInt(data.id, 10);
        this.proposal = RULE_STATE[parseInt(data.proposedAmount, 10)];
        this.blockTime = parseInt(blockTime, 10);
        this.variant = 'success';
        this.component = 'rulepollcreated-event';
    }
}

export class RewardPool {
    public address: string = '';
    public name: string = '';
    public balance: BN = new BN(0);
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
    private eventService: EventService = new EventService();

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

    public setBalance(amount: BN) {
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
        const deposits: DepositEvent[] = [];

        for (let i = 0; i < length; i++) {
            const d = await this.contract.methods.deposits(address, i)
                .call({
                    from: this.owner,
                });
            deposits.push(new DepositEvent(d));
        }

        return deposits;
    }

    public async withdrawelsOf(address: string) {
        const length = await this.contract.methods.countWithdrawels(address).call({
            from: this.owner,
        });
        const withdrawels: WithdrawelEvent[] = [];

        for (let i = 0; i < length; i++) {
            const w = await this.contract.methods.withdrawels(address, i)
                .call({
                    from: this.owner,
                });
            withdrawels.push(new WithdrawelEvent(w));
        }

        return withdrawels;
    }

    public async startRulePoll(id: number, amount: BN) {
        return await this.contract.methods.startRulePoll(id, amount.toString())
            .send({
                from: this.owner,
            });
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
