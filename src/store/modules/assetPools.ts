import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { getAssetPoolContract, NetworkProvider, send } from '@/utils/network';
import Web3 from 'web3';
import { toWei } from 'web3-utils';
import Contract from 'web3/eth/contract';

interface SignedCall {
    call: string;
    nonce: number;
    sig: string;
}

interface TokenBalance {
    name: string;
    address: string;
    symbol: string;
    balance: { type: string; hex: string };
}

export class AssetPool {
    title: string;
    contract: Contract;
    address: string;
    poolToken: TokenBalance;
    network: NetworkProvider;

    constructor(data: any) {
        this.title = data.token.symbol + ' Pool';
        this.contract = data.contract;
        this.address = data.address;
        this.poolToken = data.token;
        this.network = data.network;
    }
}

export interface IAssetPools {
    [poolAddress: string]: AssetPool;
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    _all: IAssetPools = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(assetPool: AssetPool) {
        Vue.set(this._all, assetPool.address, assetPool);
    }

    @Action
    async get({ web3, address }: { web3: Web3; address: string }) {
        try {
            const r = await axios({
                method: 'get',
                url: '/asset_pools/' + address,
                headers: { AssetPool: address },
            });

            this.context.commit(
                'set',
                new AssetPool({ ...r.data, ...{ contract: getAssetPoolContract(web3, address) } }),
            );
        } catch (e) {
            return { error: new Error(e) };
        }
    }

    @Action
    async upgradeAddress({ poolAddress, data }: { poolAddress: string; data: SignedCall }) {
        try {
            const r = await axios({
                method: 'POST',
                url: '/gas_station/upgrade_address',
                headers: {
                    AssetPool: poolAddress,
                },
                data,
            });

            if (r.status !== 200) {
                throw new Error('POST upgrade address failed.');
            }

            return r.data;
        } catch (e) {
            return {
                error: e.toString(),
            };
        }
    }

    @Action
    async deposit({
        web3,
        assetPool,
        amount,
        privateKey,
    }: {
        web3: Web3;
        assetPool: AssetPool;
        amount: string;
        privateKey: string;
    }) {
        try {
            const wei = toWei(amount);

            return await send(web3, assetPool.contract, assetPool.contract.methods.deposit(wei), privateKey);
        } catch (e) {
            return {
                error: e.toString(),
            };
        }
    }
}

export default AssetPoolModule;