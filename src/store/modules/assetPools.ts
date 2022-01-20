import axios from 'axios';
import Web3 from 'web3';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { getAssetPoolContract, send } from '@/utils/network';
import { toWei } from 'web3-utils';

interface SignedCall {
    call: string;
    nonce: number;
    sig: string;
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    @Action
    async upgradeAddress({
        poolAddress,
        newAddress,
        data,
    }: {
        poolAddress: string;
        newAddress: string;
        data: SignedCall;
    }) {
        try {
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
        } catch (error) {
            return {
                error,
            };
        }
    }

    @Action
    async deposit({
        web3,
        poolAddress,
        amount,
        privateKey,
    }: {
        web3: Web3;
        poolAddress: string;
        amount: string;
        privateKey: string;
    }) {
        try {
            const wei = toWei(amount);
            const contract = getAssetPoolContract(web3, poolAddress);

            return await send(web3, contract as any, contract.methods.deposit(wei), privateKey);
        } catch (error) {
            return {
                error,
            };
        }
    }

    @Action
    async withdrawPollCall({
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
        try {
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
        } catch (error) {
            return { error };
        }
    }

    @Action
    async claimReward(rewardHash: string) {
        try {
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

            return { withdrawal: r.data };
        } catch (error) {
            return { error };
        }
    }
}

export default AssetPoolModule;
