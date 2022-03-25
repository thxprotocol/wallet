import { Vue } from 'vue-property-decorator';
import axios from 'axios';
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

    @Action
    async getAll() {
        try {
            const r = await axios({
                method: 'GET',
                url: '/memberships',
            });

            r.data.forEach((id: string) => {
                this.context.commit('set', { id });
            });

            return r.data;
        } catch (error) {
            return { error };
        }
    }

    @Action
    async get(id: string) {
        try {
            const r = await axios({
                method: 'GET',
                url: '/memberships/' + id,
            });

            if (r.status !== 200) {
                throw new Error('GET /memberships/:id failed.');
            }

            this.context.commit('set', r.data);

            const membership = new Membership(r.data);
            return { membership };
        } catch (error) {
            return { error };
        }
    }
}

export default MembershipModule;
