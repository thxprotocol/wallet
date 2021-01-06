import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { API_URL } from '@/utils/secrets';
import { Account } from './account';
import { QR, send } from '@/utils/gasStation';
import { ASSET_POOL_ABI } from '@/utils/contracts';

interface TokenBalance {
    name: string;
    symbol: string;
    balance: { type: string; hex: string };
}

class AssetPool {
    title: string;
    address: string;
    owner: string;
    token: TokenBalance;
    isMember: string;
    isManager: string;
    balance: string;

    constructor(data: any) {
        this.title = data.title;
        this.address = data.address;
        this.owner = data.owner;
        this.token = data.token;
        this.isMember = data.isMember;
        this.isManager = data.isManager;
        this.balance = data.balance;
    }
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    _all: AssetPool[] = [];

    get all() {
        return this._all;
    }

    @Mutation
    add(membership: AssetPool) {
        console.log(this._all.length, this._all.indexOf(membership), membership);
        if (this._all.indexOf(membership) === -1) {
            this._all.push(membership);
        }
    }

    @Action
    async init({ assetPools, address }: { assetPools: string[]; address: string }) {
        try {
            for (const poolAddress of assetPools) {
                try {
                    const r: any = await axios({
                        method: 'get',
                        url: API_URL + '/asset_pools/' + poolAddress,
                        headers: { AssetPool: poolAddress },
                    });

                    const x = await axios({
                        method: 'get',
                        url: API_URL + '/members/' + address,
                        headers: { AssetPool: poolAddress },
                    });

                    this.context.commit(
                        'add',
                        new AssetPool({
                            title: r.data.title,
                            address: r.data.address,
                            owner: r.data.owner,
                            token: r.data.token,
                            isMember: x.data.isMember,
                            isManager: x.data.isManager,
                            balance: x.data.token.balance.hex,
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

    @Action
    async updateReward(result: QR) {
        const params = [result.params.id, result.params.withdrawAmount, result.params.withdrawDuration];
        return await send(result, params, ASSET_POOL_ABI, 'asset_pool');
    }

    @Action
    async claimReward(result: QR) {
        const params = [result.params.reward_id];
        return await send(result, params, ASSET_POOL_ABI, 'asset_pool');
    }
}

export default AssetPoolModule;
