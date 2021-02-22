import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';

interface WithdrawalData {
    pollId: number;
    amount: string;
    beneficiary: string;
    state: boolean;
    poolAddress: string;
}

class Withdrawal {
    id: number;
    amount: string;
    beneficiary: string;
    state: boolean;
    poolAddress: string;

    constructor({ pollId, amount, beneficiary, state, poolAddress }: WithdrawalData) {
        this.id = pollId;
        this.amount = amount;
        this.beneficiary = beneficiary;
        this.state = state;
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

    @Action
    async init({ profile, poolAddress }: { profile: UserProfile; poolAddress: string }) {
        try {
            const r = await axios({
                method: 'get',
                url: '/withdrawals?member=' + profile.address,
                headers: { AssetPool: poolAddress },
            });

            if (r.status !== 200) {
                throw Error('Withdrawals READ failed.');
            }

            for (const id of r.data.withdrawPolls) {
                const x = await axios({
                    method: 'get',
                    url: `/withdrawals/${id}`,
                    headers: { AssetPool: poolAddress },
                });

                this.context.commit('set', new Withdrawal({ ...x.data, poolAddress }));
            }
        } catch (e) {
            return e;
        }
    }
}

export default WithdrawalModule;
