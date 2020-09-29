import { Module, VuexModule, Action } from 'vuex-module-decorators';
import Web3 from 'web3';
import { ADDRESS, API_URL, PRIVATE_KEY } from '@/utils/secrets';
import { config, QR, withdrawPollContract } from '@/utils/network';
import axios from 'axios';

const from = ADDRESS;
const web3 = new Web3(config.child.RPC);

web3.defaultAccount = from;

@Module({ namespaced: true })
class WithdrawalModule extends VuexModule {
    @Action
    async vote(result: QR) {
        const nonce =
            parseInt(
                await withdrawPollContract(result.contractAddress)
                    .methods.getLatestNonce(ADDRESS)
                    .call({ from }),
                10,
            ) + 1;
        const assetPoolAddress = await withdrawPollContract(result.contractAddress)
            .methods.pool()
            .call({ from });
        const agree = !!+result.params.agree;
        const hash = web3.utils.soliditySha3(ADDRESS, agree, nonce, result.contractAddress) || '';
        const sig = web3.eth.accounts.sign(hash, PRIVATE_KEY);

        return await axios(`${API_URL}/withdrawals/${result.contractAddress}/${result.method}`, {
            method: 'post',
            headers: {
                AssetPool: assetPoolAddress,
            },
            data: {
                voter: ADDRESS,
                agree,
                nonce,
                sig: sig['signature'],
            },
        });
    }
}

export default WithdrawalModule;
