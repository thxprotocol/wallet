import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { UserProfile } from './account';

interface TokenBalance {
    name: string;
    symbol: string;
    balance: { type: string; hex: string };
}

export class Membership {
    address: string;
    title: string;
    poolAddress: string;
    poolToken: TokenBalance;
    isMember: string;
    isManager: string;

    constructor(data: any) {
        this.address = data.address;
        this.title = data.title;
        this.poolAddress = data.poolAddress;
        this.poolToken = data.poolToken;
        this.isMember = data.isMember;
        this.isManager = data.isManager;
    }
}

export interface IMemberships {
    [poolAddress: string]: Membership;
}

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: IMemberships = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(membership: Membership) {
        Vue.set(this._all, membership.poolAddress, membership);
    }

    @Action
    async read({ profile, poolAddress }: { profile: UserProfile; poolAddress: string }) {
        let title = '',
            poolToken = null,
            isMember = false,
            isManager = false;
        try {
            const r = await axios({
                method: 'get',
                url: '/asset_pools/' + poolAddress,
                headers: { AssetPool: poolAddress },
            });

            title = r.data.title;
            poolAddress = r.data.address;
            poolToken = r.data.token;

            const x = await axios({
                method: 'get',
                url: '/members/' + profile.address,
                headers: { AssetPool: poolAddress },
            });

            isMember = x.data.isMember;
            isManager = x.data.isManager;
        } catch (e) {
            // if (e.response.status !== 404) {
            //     return;
            // }
        } finally {
            this.context.commit(
                'set',
                new Membership({
                    address: profile.address,
                    title,
                    poolAddress,
                    poolToken,
                    isMember,
                    isManager,
                }),
            );
        }
    }

    // @Action
    // async updateReward(result: QR) {
    //     const params = [result.params.id, result.params.withdrawAmount, result.params.withdrawDuration];
    //     return await send(result, params, ASSET_POOL_ABI, 'asset_pool');
    // }

    // @Action
    // async claimReward(result: QR) {
    //     const params = [result.params.reward_id];
    //     return await send(result, params, ASSET_POOL_ABI, 'asset_pool');
    // }
}

export default MembershipModule;
