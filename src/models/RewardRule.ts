import BN from 'bn.js';
import { BasePoll } from './BasePoll';

const RULE_STATE = ['Active', 'Disabled'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class RewardRule {
    public id: number;
    public state: string;
    public created: string;
    public amount: BN;
    public pollAddress: string;

    public title: string = '';
    public description: string = '';

    constructor(data: any, meta: any) {
        this.id = parseInt(data.id, 10);
        this.state = RULE_STATE[parseInt(data.state, 10)];
        this.created = data.created;
        this.pollAddress = data.poll;
        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER);

        if (meta) {
            this.title = meta.title;
            this.description = meta.description;
        }
    }
}

export class RewardRulePoll extends BasePoll {
    public proposedAmount!: BN;

    constructor(
        address: string,
        contract: any,
        owner: string,
    ) {
        super(
            address,
            contract,
            owner,
        );
    }

    public async update() {
        this.loading = true;

        const proposedAmount = await this.contract.methods.proposedAmount().call({ from: this.owner });
        this.proposedAmount = new BN(proposedAmount).div(TOKEN_MULTIPLIER);

        await this.updateBasePoll();

        this.loading = false;
    }
}
