import { Module, VuexModule, Action } from 'vuex-module-decorators';
import Web3 from 'web3';
import { ADDRESS, API_URL, GAS_STATION_ADDRESS } from '@/utils/secrets';
import { QR, gasStation, account } from '@/utils/network';
import axios from 'axios';
import { ethers } from 'ethers';
import * as BASE_POLL from '../../artifacts/BasePoll.json';

const web3 = new Web3();

@Module({ namespaced: true })
class BasePollModule extends VuexModule {
    @Action
    async vote(result: QR) {
        const nonce = parseInt(await gasStation.getLatestNonce(ADDRESS), 10) + 1;
        const contractInterface = new ethers.utils.Interface(BASE_POLL.abi);
        const call = contractInterface.encodeFunctionData('vote', [result.params.agree]);
        const hash = web3.utils.soliditySha3(call, result.contractAddress, GAS_STATION_ADDRESS, nonce) || '';
        const sig = await account.signMessage(ethers.utils.arrayify(hash));

        return await axios(`${API_URL}/polls/${result.contractAddress}/vote`, {
            method: 'post',
            headers: {
                AssetPool: result.assetPoolAddress,
            },
            data: {
                call,
                nonce,
                sig,
            },
        });
    }

    @Action
    async revokeVote(result: QR) {
        const nonce = parseInt(await gasStation.getLatestNonce(ADDRESS), 10) + 1;
        const contractInterface = new ethers.utils.Interface(BASE_POLL.abi);
        const call = contractInterface.encodeFunctionData('revokeVote', []);
        const hash = web3.utils.soliditySha3(call, result.contractAddress, GAS_STATION_ADDRESS, nonce) || '';
        const sig = await account.signMessage(ethers.utils.arrayify(hash));

        return await axios(`${API_URL}/polls/${result.assetPoolAddress}/vote`, {
            method: 'delete',
            headers: {
                AssetPool: result.assetPoolAddress,
            },
            data: {
                call,
                nonce,
                sig,
            },
        });
    }
}

export default BasePollModule;
