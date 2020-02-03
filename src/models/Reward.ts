import BN from 'bn.js';
import { BasePoll } from './BasePoll';

const REWARD_STATE = ['Approved', 'Rejected'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class Reward extends BasePoll {
    public id!: number;
    public state!: string;
    public created!: number;
    public amount!: BN;
    public beneficiary!: string;

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

        this.update();
    }

    public async update() {
        this.loading = true;

        const id = await this.contract.methods.id().call({ from: this.owner });
        const state = await this.contract.methods.state().call({ from: this.owner });
        const created = await this.contract.methods.created().call({ from: this.owner });
        const amount = await this.contract.methods.amount().call({ from: this.owner });

        this.id = parseInt(id, 10);
        this.created = parseInt(created, 10);
        this.state = REWARD_STATE[parseInt(state, 10)];
        this.amount = new BN(amount).div(TOKEN_MULTIPLIER);
        this.beneficiary = await this.contract.methods.beneficiary().call({ from: this.owner });

        await this.updateBasePoll();

        this.loading = false;
    }
}
