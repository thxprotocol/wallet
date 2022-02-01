import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';

interface MembershipData {
    id: string;
    network: number;
    poolAddress: string;
    token: any;
    pendingBalance: number;
}

export class Membership {
    id: string;
    network: number;
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

            if (r.status !== 200) {
                throw new Error('GET /memberships failed.');
            }

            for (const id of r.data) {
                await this.context.dispatch('get', id);
            }

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

            return new Membership(r.data);
        } catch (error) {
            return { error: new Error('Unable to get membership.') };
        }
    }
}

export default MembershipModule;
