import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';

interface WithdrawalData {
    id: number;
    amount: string;
    beneficiary: string;
    approved: boolean;
    state: number;
    poolAddress: string;
}

export class Withdrawal {
    id: number;
    amount: string;
    beneficiary: string;
    state: number;
    approved: boolean;
    poolAddress: string;

    constructor({ id, amount, state, beneficiary, approved, poolAddress }: WithdrawalData) {
        this.id = id;
        this.amount = amount;
        this.state = state;
        this.beneficiary = beneficiary;
        this.approved = approved;
        this.poolAddress = poolAddress;
    }
}

export interface IWithdrawals {
    [poolAddress: string]: {
        [pollId: string]: Withdrawal;
    };
}

@Module({ namespaced: true })
class WithdrawalModule extends VuexModule {
    _all: IWithdrawals = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(withdrawal: Withdrawal) {
        if (!this._all[withdrawal.poolAddress]) {
            Vue.set(this._all, withdrawal.poolAddress, {});
        }
        Vue.set(this._all[withdrawal.poolAddress], withdrawal.id, withdrawal);
    }

    @Mutation
    unset(withdrawal: Withdrawal) {
        Vue.delete(this._all[withdrawal.poolAddress], withdrawal.id);
    }

    @Action
    async init({
        profile,
        poolAddress,
        page,
        limit,
        state,
    }: {
        profile: UserProfile;
        poolAddress: string;
        page: number;
        limit: number;
        state: number;
    }) {
        try {
            const r = await axios({
                method: 'get',
                url: '/withdrawals?member=' + profile.address + '&page=' + page + '&limit=' + limit + '&state=' + state,
                headers: { AssetPool: poolAddress },
            });

            if (r.status !== 200) {
                throw Error('Withdrawals READ failed.');
            }
            for (const withdrawal of r.data.results) {
                this.context.commit('set', new Withdrawal({ ...withdrawal, poolAddress }));
            }
        } catch (e) {
            return e;
        }
    }

    @Action
    async remove(withdrawal: Withdrawal) {
        try {
            this.context.commit('unset', withdrawal);
        } catch (e) {
            console.log(e);
            debugger;
        }
    }

}

export default WithdrawalModule;
