import Vue from 'vue';
import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { getGasToken, isPrivateKey, NetworkProvider } from '@/utils/network';
import { MAIN_CHILD_RPC, TEST_CHILD_RPC } from '@/utils/secrets';

export interface Network {
    name: string;
    provider: Web3;
}

export interface GasToken {
    name: string;
    symbol: string;
    balance: string;
}

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    _providers: Network[] = [
        {
            name: 'Polygon Testnet',
            provider: new Web3(TEST_CHILD_RPC),
        },
        {
            name: 'Polygon Mainnet',
            provider: new Web3(MAIN_CHILD_RPC),
        },
    ];
    _currentNetwork: NetworkProvider = NetworkProvider.Main;
    _web3: Web3 | null = null;
    _gasToken: GasToken | null = null;

    get current() {
        return this._providers[this._currentNetwork];
    }

    get web3() {
        return this._web3;
    }

    get gasToken() {
        return this._gasToken;
    }

    @Mutation
    setCurrentNetwork(npid: NetworkProvider) {
        Vue.set(this, '_currentNetwork', npid);
    }

    @Mutation
    setWeb3(web3: Web3) {
        Vue.set(this, '_web3', web3);
    }

    @Mutation
    setGasToken(gasToken: GasToken) {
        Vue.set(this, '_gasToken', gasToken);
    }

    @Action
    async setNetwork({ npid, privateKey }: { npid: NetworkProvider; privateKey: string }) {
        try {
            if (isPrivateKey(privateKey)) {
                const web3 = this._providers[npid].provider;
                const account = web3.eth.accounts.privateKeyToAccount(privateKey);

                web3.eth.accounts.wallet.add(account);
                web3.eth.defaultAccount = account.address;

                this.context.commit('setCurrentNetwork', npid);
                this.context.commit('setWeb3', web3);
                this.context.commit('setGasToken', await getGasToken(web3, account.address));
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export default NetworkModule;
