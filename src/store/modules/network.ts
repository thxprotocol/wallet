import Web3 from 'web3';
import { Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { getGasToken, NetworkProvider } from '@/utils/network';
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
            name: 'Polygon Test Network',
            provider: new Web3(TEST_CHILD_RPC),
        },
        {
            name: 'Polygon Main Network',
            provider: new Web3(MAIN_CHILD_RPC),
        },
    ];
    _currentNetwork: NetworkProvider = NetworkProvider.Main;
    _web3: Web3 | null = null;
    _gasToken!: GasToken;

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
    async setNetwork({ npid, privateKey }: { npid: NetworkProvider; privateKey: string }) {
        const web3 = this._providers[npid].provider;
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);

        web3.eth.accounts.wallet.add(account);
        web3.eth.defaultAccount = account.address;

        this._currentNetwork = npid;
        this._web3 = web3;
        this._gasToken = await getGasToken(web3, account.address);
    }
}

export default NetworkModule;
