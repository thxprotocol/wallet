import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';

interface WithdrawalData {
    id: number;
    amount: string;
    beneficiary: string;
    state: boolean;
    poolAddress: string;
}

export class Withdrawal {
    id: number;
    amount: string;
    beneficiary: string;
    state: boolean;
    poolAddress: string;

    constructor({ id, amount, beneficiary, state, poolAddress }: WithdrawalData) {
        this.id = id;
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

    @Mutation
    remove(withdrawal: Withdrawal) {
        Vue.delete(this._all[withdrawal.poolAddress], withdrawal.id);
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

            for (const withdrawPoll of r.data.withdrawPolls) {
                this.context.commit('set', new Withdrawal({ ...withdrawPoll, poolAddress }));
            }

            // for (const withdrawn of r.data.withdrawn) {
            //     this.context.commit('set', new Withdrawal({ ...withdrawn, poolAddress }));
            // }
        } catch (e) {
            return e;
        }
    }
}

export default WithdrawalModule;
