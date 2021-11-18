import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';

interface MembershipData {
    id: string;
    network: number;
    poolAddress: string;
    tokenAddress: string;
}

export class Membership {
    id: string;
    network: number;
    poolAddress: string;
    tokenAddress: string;

    constructor({ id, network, poolAddress, tokenAddress}: MembershipData) {
        this.id = id;
        this.network = network;
        this.poolAddress = poolAddress;
        this.tokenAddress = tokenAddress;
    }
}

export interface IMembership {
    [poolAddress: string]: Membership;
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: IMembership = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(membership: Membership) {
        if (!this._all[membership.poolAddress]) {
            Vue.set(this._all, membership.poolAddress, {});
        }
        Vue.set(this._all[membership.poolAddress], membership.id, membership);
    }

    @Mutation
    unset(membership: Membership) {
        Vue.delete(this._all[membership.poolAddress], membership.id);
    }

    @Action
    async get(id: string) {
        try {
            const r = await axios({
                method: 'GET',
                url: '/memberships/' + id,
            });

            if (r.status !== 200) {
                return { error: Error('GET /memberships/:id failed.') };
            }

            this.context.commit('set', r.data);
        } catch (e) {
            console.log(e);
            return { error: new Error('Unable to get membership.') };
        }
    }
}

export default MembershipModule;
