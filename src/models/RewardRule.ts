import BN from 'bn.js';
import { BasePoll } from './BasePoll';

const RULE_STATE = ['Active', 'Disabled'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export interface IRewardRules {
    [id: string]: RewardRule;
}

export class RewardRule {
    public id: number;
    public state: string;
    public created: number;
    public amount: BN;
    public pollAddress: string;
    public poll: RewardRulePoll | null = null;
    public title: string = '';
    public description: string = '';

    constructor(data: any, meta: any) {
        this.id = parseInt(data.id, 10);
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.created = parseInt(data.created, 10);
        this.pollAddress = data.poll;
        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER);

        if (meta) {
            this.title = meta.title;
            this.description = meta.description;
        }
    }

    public get hasPollAddress() {
        return this.pollAddress !== '0x0000000000000000000000000000000000000000';
    }

    public setPoll(poll: RewardRulePoll) {
        this.poll = poll;
    }
}

export class RewardRulePoll extends BasePoll {
    public proposedAmount!: BN;

    constructor(address: string, contract: any, owner: string) {
        super(address, contract, owner);
    }

    public async update() {
        this.loading = true;
        this.proposedAmount = new BN(await this.contract.methods.proposedAmount().call({ from: this.owner })).div(
            TOKEN_MULTIPLIER,
        );

        await this.updateBasePoll();

        this.loading = false;
    }
}
