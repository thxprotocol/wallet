import BN from 'bn.js';
import { BasePoll } from './BasePoll';
import UserService from '@/services/UserService';

const REWARD_STATE = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];
const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export interface IRewards {
    [id: string]: Reward;
}

export class Reward extends BasePoll {
    public id!: number;
    public rule!: number;
    public state: string = '';
    public created!: number;
    public amount!: BN;
    public beneficiaryAddress!: string;
    public beneficiary!: string;
    private userService: UserService = new UserService();

    constructor(
        id: number,
        address: string,
        contract: any,
        owner: string,
    ) {
        super(
            address,
            contract,
            owner,
        );
        this.id = id;
        this.update();
    }

    public async update() {
        this.loading = true;

        const id = await this.contract.methods.id().call({ from: this.owner });
        const rule = await this.contract.methods.rule().call({ from: this.owner });
        const state = await this.contract.methods.state().call({ from: this.owner });
        const created = await this.contract.methods.created().call({ from: this.owner });
        const amount = await this.contract.methods.amount().call({ from: this.owner });
        const beneficiary = await this.contract.methods.beneficiary().call({ from: this.owner });

        this.id = parseInt(id, 10);
        this.rule = parseInt(rule, 10);
        this.created = parseInt(created, 10);
        this.state = REWARD_STATE[parseInt(state, 10)];
        this.amount = new BN(amount).div(TOKEN_MULTIPLIER);
        this.beneficiaryAddress = beneficiary;
        this.beneficiary = await this.userService.getMemberByAddress(beneficiary);

        await this.updateBasePoll();

        this.loading = false;
    }

    public async getState() {
        const state = await this.contract.methods.state().call({ from: this.owner });

        return REWARD_STATE[parseInt(state, 10)];
    }

    public async getHasVoted() {
        const vote: any = await this.contract.methods.votesByAddress(this.owner).call({ from: this.owner });

        return parseInt(vote.time, 10) ? true : false;
    }

}
