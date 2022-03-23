import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';
import { Membership } from './memberships';

export enum WithdrawalState {
    Pending = 0,
    Withdrawn = 1,
}

export enum WithdrawalType {
    ClaimReward = 0,
    ClaimRewardFor = 1,
    ProposeWithdrawal = 2,
}

interface WithdrawalData {
    id: number;
    amount: string;
    beneficiary: string;
    approved: boolean;
    state: number;
    type: WithdrawalType;
    poolAddress: string;
    withdrawalId: number;
    failReason?: string;
    rewardId?: number;
    createdAt: string;
    updatedAt: string;
}

export class Withdrawal {
    id: number;
    amount: string;
    beneficiary: string;
    state: number;
    approved: boolean;
    withdrawalId: number;
    rewardId?: number;
    failReason?: string;
    createdAt: string;
    updatedAt: string;
    page: number;
    type: WithdrawalType;

    constructor(data: WithdrawalData, page: number) {
        this.id = data.id;
        this.amount = data.amount;
        this.state = data.state;
        this.beneficiary = data.beneficiary;
        this.approved = data.approved;
        this.withdrawalId = data.withdrawalId;
        this.rewardId = data.rewardId;
        this.type = data.type;
        this.page = page;
        this.failReason = data.failReason;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
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

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action
    async withdraw({ membership, id }: any) {
        try {
            const r = await axios({
                method: 'POST',
                url: `/withdrawals/${id}/withdraw`,
                headers: {
                    AssetPool: membership.poolAddress,
                },
            });

            this.context.commit('withdrawals/set', { withdrawal: r.data, membership: membership });
        } catch (error) {
            return error;
        }
    }

    @Action
    async remove({ membership, withdrawal }: any) {
        try {
            await axios({
                method: 'DELETE',
                url: `/withdrawals/${withdrawal.id}`,
                headers: {
                    AssetPool: membership.poolAddress,
                },
            });

            this.context.commit('unset', { membership, withdrawal });
        } catch (error) {
            return error;
        }
    }

    @Action
    async filter({
        profile,
        membership,
        page = 1,
        limit = 10,
        state,
    }: {
        profile: UserProfile;
        membership: Membership;
        page: number;
        limit: number;
        state?: WithdrawalState;
    }) {
        try {
            const params = new URLSearchParams();
            params.append('member', profile.address);
            params.append('page', String(page));
            params.append('limit', String(limit));

            if (state === WithdrawalState.Pending || state === WithdrawalState.Withdrawn) {
                params.append('state', String(state));
            }

            const r = await axios({
                method: 'get',
                url: '/withdrawals',
                params,
                headers: { AssetPool: membership.poolAddress },
            });

            if (r.status !== 200) {
                throw Error('Withdrawals READ failed.');
            }

            this.context.commit('clear');

            for (const withdrawal of r.data.results) {
                this.context.commit('set', { withdrawal: new Withdrawal(withdrawal, page), membership });
            }

            return { pagination: r.data };
        } catch (e) {
            return e;
        }
    }
}

export default WithdrawalModule;
