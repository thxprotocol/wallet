import axios, { AxiosError } from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';

interface SignedCall {
    call: string;
    nonce: number;
    sig: string;
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    @Action({ rawError: true })
    async upgradeAddress({ poolId, newAddress, data }: { poolId: string; newAddress: string; data: SignedCall }) {
        const r = await axios({
            method: 'POST',
            url: '/gas_station/upgrade_address',
            headers: {
                'X-PoolId': poolId,
            },
            data: { newAddress, ...data },
        });

        if (r.status !== 200) {
            throw new Error('POST upgrade address failed.');
        }

        return r.data;
    }

    @Action({ rawError: true })
    async claimReward({ claimId, rewardHash }: { claimId: string; rewardHash: string }) {
        let res, data;
        if (rewardHash) {
            data = JSON.parse(atob(rewardHash));
        } else if (claimId) {
            try {
                res = await axios({
                    method: 'GET',
                    url: `/claims/${claimId}`,
                });
                data = res.data;
            } catch (error) {
                if ((error as AxiosError).response?.status === 403) return { error };
                throw error;
            }
        }

        try {
            res = await axios({
                method: 'POST',
                url: `/rewards/${data.rewardId}/claim`,
                headers: { 'X-PoolId': data.poolId },
                data: { claimId },
            });
        } catch (error) {
            if ((error as AxiosError).response?.status === 403) return { error };
            throw error;
        }

        return { withdrawal: { ...res.data, ...{ tokenSymbol: data.tokenSymbol } } };
    }
}

export default AssetPoolModule;
