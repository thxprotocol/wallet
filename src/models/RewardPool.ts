import EventService from '@/services/EventService';
import BN from 'bn.js';

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
        'RewardPollCreated',
        'RewardPollFinished',
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

    public async countRewards() {
        return await this.contract.methods.countRewards().call({
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
