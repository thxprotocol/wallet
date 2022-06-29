import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@/utils/network';

export type Membership = {
    id: string;
    chainId: ChainId;
    poolAddress: string;
    token: any;
    tokens: any;
    erc20: string;
    erc721: string;
    poolBalance?: number;
    pendingBalance?: number;
    sub: string;
};

export interface IMemberships {
    [id: string]: Membership;
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: IMemberships = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(membership: Membership) {
        Vue.set(this._all, membership.id, membership);
    }

    @Mutation
    unset(membership: Membership) {
        Vue.delete(this._all, membership.id);
    }

    @Action({ rawError: true })
    async getAll() {
        const r = await axios({
            method: 'GET',
            url: '/memberships',
        });

        r.data.forEach((id: string) => {
            this.context.commit('set', { id });
        });
    }

    @Action({ rawError: true })
    async delete(id: string) {
        await axios({
            method: 'DELETE',
            url: `/memberships/${id}`,
        });

        this.context.commit('unset', { id });
    }

    @Action({ rawError: true })
    async get(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/memberships/' + id,
        });
        this.context.commit('set', data);
    }
}

export default MembershipModule;
