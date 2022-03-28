import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { getAssetPoolContract, NetworkProvider, send } from '@/utils/network';
import { toWei } from 'web3-utils';

interface SignedCall {
    call: string;
    nonce: number;
    sig: string;
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    @Action({ rawError: true })
    async upgradeAddress({
        poolAddress,
        newAddress,
        data,
    }: {
        poolAddress: string;
        newAddress: string;
        data: SignedCall;
    }) {
        const r = await axios({
            method: 'POST',
            url: '/gas_station/upgrade_address',
            headers: {
                AssetPool: poolAddress,
            },
            data: {
                newAddress,
                ...data,
            },
        });

        if (r.status !== 200) {
            throw new Error('POST upgrade address failed.');
        }

        return r.data;
    }

    @Action({ rawError: true })
    async deposit({ network, poolAddress, amount }: { network: NetworkProvider; poolAddress: string; amount: string }) {
        const wei = toWei(amount);
        const web3 = this.context.rootGetters['network/all'][network];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const contract = getAssetPoolContract(web3, poolAddress);

        return await send(web3, poolAddress, contract.methods.deposit(wei), privateKey);
    }

    @Action({ rawError: true })
    async withdraw({
        poolAddress,
        call,
        nonce,
        sig,
    }: {
        poolAddress: string;
        call: string;
        nonce: string;
        sig: SignedCall;
    }) {
        const r = await axios({
            method: 'POST',
            url: '/gas_station/call',
            headers: {
                AssetPool: poolAddress,
            },
            data: {
                call,
                nonce,
                sig,
            },
        });

        if (r.status !== 200) {
            throw new Error('POST withdraw Poll call failed.');
        }

        return { withdrawal: r.data };
    }

    @Action({ rawError: true })
    async claimReward(rewardHash: string) {
        const data = JSON.parse(atob(rewardHash));
        const r = await axios({
            method: 'POST',
            url: `/rewards/${data.rewardId}/claim`,
            headers: {
                AssetPool: data.poolAddress,
            },
        });
        if (r.status !== 200) {
            throw new Error('POST claim reward failed.');
        }

        return { withdrawal: { ...r.data, ...{ tokenSymbol: data.tokenSymbol } } };
    }
}

export default AssetPoolModule;
