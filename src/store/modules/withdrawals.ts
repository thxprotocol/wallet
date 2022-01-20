import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';
import { Membership } from './memberships';

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

    constructor({ id, amount, state, beneficiary, approved }: WithdrawalData) {
        this.id = id;
        this.amount = amount;
        this.state = state;
        this.beneficiary = beneficiary;
        this.approved = approved;
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
    set({ withdrawal, membership }: { withdrawal: Withdrawal; membership: Membership }) {
        if (!this._all[membership.id]) {
            Vue.set(this._all, membership.id, {});
        }
        Vue.set(this._all[membership.id], withdrawal.id, withdrawal);
    }

    @Mutation
    unset({ withdrawal, membership }: { withdrawal: Withdrawal; membership: Membership }) {
        Vue.delete(this._all[membership.id], withdrawal.id);
    }

    @Action
    async filter({
        profile,
        membership,
        page,
        limit,
        state,
    }: {
        profile: UserProfile;
        membership: Membership;
        page: number;
        limit: number;
        state: number;
    }) {
        try {
            const r = await axios({
                method: 'get',
                url: '/withdrawals?member=' + profile.address + '&page=' + page + '&limit=' + limit + '&state=' + state,
                headers: { AssetPool: membership.poolAddress },
            });

            if (r.status !== 200) {
                throw Error('Withdrawals READ failed.');
            }
            for (const withdrawal of r.data.results) {
                this.context.commit('set', { withdrawal: new Withdrawal(withdrawal), membership });
            }
        } catch (e) {
            return e;
        }
    }
}

export default WithdrawalModule;
