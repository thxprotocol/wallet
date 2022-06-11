import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { isPrivateKey, NetworkProvider, send } from '@/utils/network';
import { MAIN_CHILD_RPC, TEST_CHILD_RPC } from '@/utils/secrets';
import { fromWei, toWei } from 'web3-utils';
import { ChainId } from '@/utils/network';
import axios from 'axios';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';

export type TNetworkConfig = {
    npid: NetworkProvider;
    privateKey: string;
};

export type TNetworks = {
    [NetworkProvider.Test]: Web3;
    [NetworkProvider.Main]: Web3;
};

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    _networks: { [npid: number]: Web3 } = {
        [NetworkProvider.Test]: new Web3(TEST_CHILD_RPC),
        [NetworkProvider.Main]: new Web3(MAIN_CHILD_RPC),
    };

    get all() {
        return this._networks;
    }

    @Mutation
    setConfig({ npid, privateKey }: TNetworkConfig) {
        const network = this._networks[npid];
        const admin = network.eth.accounts.privateKeyToAccount(privateKey);

        network.eth.accounts.wallet.add(admin);
        network.eth.defaultAccount = admin.address;
    }

    @Action({ rawError: true })
    async sendValue({ web3, to, amount }: { web3: Web3; to: string; amount: string }) {
        const value = toWei(amount);
        const gas = await web3.eth.estimateGas({ to, value });
        const tx = await web3.eth.sendTransaction({ gas, to, value });

        return { tx };
    }

    @Action({ rawError: true })
    async setNetwork(config: { npid: NetworkProvider; privateKey: string }) {
        if (isPrivateKey(config.privateKey)) {
            this.context.commit('setConfig', config);
        }
    }

    @Action({ rawError: true })
    async approve(payload: { chainId: ChainId; poolAddress: string; amount: string; tokenAddress: string }) {
        const npid = payload.chainId === 31337 ? NetworkProvider.Main : payload.chainId; // TODO this is only here for testing purposes. Move to chainId usage soon
        const web3: Web3 = this._networks[npid];
        const profile = this.context.rootGetters['account/profile'];
        const privateKey = this.context.rootGetters['account/privateKey'];
        const balance = Number(fromWei(await web3.eth.getBalance(profile.address)));

        if (balance === 0) {
            await axios({
                method: 'POST',
                url: `/deposits/approve`,
                headers: {
                    'X-PoolAddress': payload.poolAddress,
                },
                data: {
                    amount: payload.amount,
                },
            });
        }

        const tokenContract = new web3.eth.Contract(ERC20Abi as any, payload.tokenAddress);
        const receipt = await send(
            web3,
            payload.tokenAddress,
            tokenContract.methods.approve(payload.poolAddress, payload.amount),
            privateKey,
        );

        return receipt;
    }
}

export default NetworkModule;
