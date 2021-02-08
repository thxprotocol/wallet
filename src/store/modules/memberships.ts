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

@Module({ namespaced: true })
class MembershipModule extends VuexModule {
    _all: Membership[] = [];

    get all() {
        return this._all;
    }

    @Mutation
    add(membership: Membership) {
        const index = this._all.findIndex(m => membership.address === m.address);
        if (index > -1) {
            this._all.splice(index, 1, membership);
            return;
        }
        this._all.push(membership);
    }

    @Action
    async init(profile: UserProfile) {
        try {
            for (const poolAddress of profile.memberships) {
                try {
                    const r: any = await axios({
                        method: 'get',
                        url: '/asset_pools/' + poolAddress,
                        headers: { AssetPool: poolAddress },
                    });

                    const x = await axios({
                        method: 'get',
                        url: '/members/' + profile.address,
                        headers: { AssetPool: poolAddress },
                    });

                    this.context.commit(
                        'add',
                        new Membership({
                            address: profile.address,
                            title: r.data.title,
                            poolAddress: r.data.address,
                            poolToken: r.data.token,
                            isMember: x.data.isMember,
                            isManager: x.data.isManager,
                        }),
                    );
                } catch (e) {
                    continue;
                }
            }
        } catch (e) {
            return e;
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
