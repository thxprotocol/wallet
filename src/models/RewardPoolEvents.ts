import BN from 'bn.js';
import UserService from '@/services/UserService';

const RULE_STATE = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class RewardPoolEvents {
    public eventTypes: string[] = [
        'Deposited',
        'ManagerAdded',
        'ManagerRemoved',
        'MemberAdded',
        'MemberRemoved',
        'RewardPollCreated',
        'RewardPollFinished',
        'RulePollCreated',
        'RulePollFinished',
        'RuleStateChanged',
        'Withdrawn',
    ];
}

export class TransactionEvent {
    public component: string;
    public blockTime: number;
    public from: any | null = null;

    constructor(data: any, blockTime: string) {
        this.component = '';
        this.blockTime = parseInt(blockTime, 10);

        if (data.from) {
            const userService = new UserService();

            userService.getMemberByAddress(data.from).then((m: any) => {
                this.from = m;
            });
        }
    }
}

export class DepositEvent extends TransactionEvent {
    public sender: string;
    public amount: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.amount = new BN(data.event.amount).div(TOKEN_MULTIPLIER).toString();
        this.sender = data.event.sender;
        this.component = 'deposit-event';
    }
}

export class WithdrawelEvent extends TransactionEvent {
    public beneficiary: string;
    // public reward: number;
    public amount: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        // this.reward = parseInt(data.event.reward, 10);
        this.amount = new BN(data.event.reward).div(TOKEN_MULTIPLIER).toString();
        this.beneficiary = data.event.beneficiary;
        this.component = 'withdrawel-event';
    }
}

export class RuleStateChangedEvent extends TransactionEvent {
    public rule: number;
    public state: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.event.id, 10);
        this.state = RULE_STATE[parseInt(data.event.state, 10)];
        this.component = 'rulestatechanged-event';
    }
}

export class RulePollCreatedEvent extends TransactionEvent {
    public rule: number;
    public proposedAmount: BN;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.event.id, 10);
        this.proposedAmount = new BN(data.event.proposedAmount).div(TOKEN_MULTIPLIER);
        this.component = 'rulepollcreated-event';
    }
}

export class RulePollFinishedEvent extends TransactionEvent {
    public rule: number;
    public approved: boolean;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.rule = parseInt(data.event.id, 10);
        this.approved = data.event.approved;
        this.component = 'rulepollfinished-event';
    }
}

export class RewardPollCreatedEvent extends TransactionEvent {
    public id: number;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.id = parseInt(data.event.reward, 10);
        this.component = 'rewardpollcreated-event';
    }
}

export class RewardPollFinishedEvent extends TransactionEvent {
    public id: number;
    public approved: boolean;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.id = parseInt(data.event.reward, 10);
        this.approved = data.event.approved;
        this.component = 'rewardpollfinished-event';
    }
}

export class MemberAddedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.account = data.event.account;
        this.component = 'memberadded-event';
    }
}

export class MemberRemovedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.account = data.event.account;
        this.component = 'memberremoved-event';
    }
}

export class ManagerAddedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.account = data.event.account;
        this.component = 'manageradded-event';
    }
}

export class ManagerRemovedEvent extends TransactionEvent {
    public account: string;

    constructor(data: any, blockTime: string) {
        super(data, blockTime);

        this.account = data.event.account;
        this.component = 'managerremoved-event';
    }
}
