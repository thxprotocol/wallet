import { Vue } from 'vue-property-decorator';
import axios, { AxiosError } from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { NetworkProvider } from '@/utils/network';

interface MembershipData {
    id: string;
    network: number;
    poolAddress: string;
    token: any;
    pendingBalance: number;
}

export class Membership {
    id: string;
    network: NetworkProvider;
    poolAddress: string;
    token: any;
    pendingBalance: number;

    constructor({ id, network, poolAddress, token, pendingBalance }: MembershipData) {
        this.id = id;
        this.network = network;
        this.poolAddress = poolAddress;
        this.token = token;
        this.pendingBalance = pendingBalance;
    }
}

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

        return r.data;
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
        let res;
        try {
            res = await axios({
                method: 'GET',
                url: '/memberships/' + id,
            });
        } catch (error) {
            if ((error as AxiosError).response?.status === 404) {
                return { membership: null };
            }
            throw error;
        }

        this.context.commit('set', res.data);

        const membership = new Membership(res.data);

        return { membership };
    }
}

export default MembershipModule;
