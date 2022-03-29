import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { isPrivateKey, NetworkProvider } from '@/utils/network';
import { MAIN_CHILD_RPC, TEST_CHILD_RPC } from '@/utils/secrets';
import { toWei } from 'web3-utils';

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
    _networks = {
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
}

export default NetworkModule;
