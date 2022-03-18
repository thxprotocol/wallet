import axios from 'axios';
import { Vue } from 'vue-property-decorator';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';

export type TDeposit = {
    id: string;
};

export interface IPromoCodes {
    [poolAddress: string]: {
        [id: string]: TDeposit;
    };
}

@Module({ namespaced: true })
class DepositsModule extends VuexModule {
    _all: IPromoCodes = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ deposit, membership }: { deposit: TDeposit; membership: Membership }) {
        if (!this._all[membership.id]) {
            Vue.set(this._all, membership.id, {});
        }
        Vue.set(this._all[membership.id], deposit.id, deposit);
    }

    @Mutation
    unset({ deposit, membership }: { deposit: TDeposit; membership: Membership }) {
        Vue.delete(this._all[membership.id], deposit.id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action
    async create({ membership, item, calldata }: { membership: Membership; item: string; calldata: any }) {
        try {
            // 1. Subscribe for MATIC Transfer into account
            // 2. Call API to topup account
            // 3. Approve pool.token unlimited for API to spend
            // 4. Call API to deposit into pool
            const { call, nonce, sig } = calldata;
            const { data } = await axios({
                method: 'POST',
                url: '/deposits',
                headers: {
                    AssetPool: membership.poolAddress,
                },
                data: {
                    call,
                    nonce,
                    sig,
                    item,
                },
            });

            this.context.commit('set', { deposit: data, membership });

            return { deposit: data };
        } catch (error) {
            return { error };
        }
    }
}

export default DepositsModule;