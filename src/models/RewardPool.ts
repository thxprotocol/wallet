import EventService from '@/services/EventService';
import BN from 'bn.js';

const RULE_STATE = ['Active', 'Disabled'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class TransactionEvent {
    public hash: string;
    public component: string;
    public blockTime: number;

    constructor(data: any, blockTime: string) {
        this.hash = data.hash;
        this.component = '';
        this.blockTime = parseInt(blockTime, 10);
    }
}

export class DepositEvent extends TransactionEvent {
    public sender: string;
    public amount: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER).toString();
        this.sender = data.sender;
        this.component = 'deposit-event';
    }
}

export class WithdrawelEvent extends TransactionEvent {
    public receiver: string;
    public amount: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER).toString();
        this.receiver = data.receiver;
        this.component = 'withdrawel-event';
    }
}

export class RuleStateChangedEvent extends TransactionEvent {
    public rule: number;
    public state: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.id, 10);
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.component = 'rulestatechanged-event';
    }
}

export class RulePollCreatedEvent extends TransactionEvent {
    public rule: number;
    public proposedAmount: BN;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.id, 10);
        this.proposedAmount = new BN(data.proposedAmount).div(TOKEN_MULTIPLIER);
        this.component = 'rulepollcreated-event';
    }
}

export class RulePollFinishedEvent extends TransactionEvent {
    public rule: number;
    public approved: boolean;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.id, 10);
        this.approved = data.approved;
        this.component = 'rulepollfinished-event';
    }
}

export class MemberAddedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);
        this.account = data.account;
        this.component = 'memberadded-event';
    }
}

export class MemberRemovedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);
        this.account = data.account;
        this.component = 'memberremoved-event';
    }
}

export class RewardPool {
    public address: string = '';
    public name: string = '';
    public balance: BN = new BN(0);
    public outOfSync: boolean = true;
    public contract: any;
    public eventTypes: string[] = [
        'Deposited', //
        'ManagerAdded',
        'ManagerRemoved',
        'MemberAdded', //
        'MemberRemoved', //
        'RulePollCreated', //
        'RulePollFinished', //
        'RuleStateChanged', //
        'Withdrawn', //
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

    public async countDeposits(address: string) {
        return await this.contract.methods.countDeposits(address).call({
            from: this.owner,
        });
    }

    public async countWithdrawels(address: string) {
        return await this.contract.methods.countDeposits(address).call({
            from: this.owner,
        });
    }

    public async depositOf(address: string, index: number) {
        return await this.contract.methods.deposits(address, index)
            .call({
                from: this.owner,
            });
    }

    public async withdrawelOf(address: string, index: number) {
        return await this.contract.methods.withdrawels(address, index)
            .call({
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
