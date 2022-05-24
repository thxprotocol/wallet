import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { toHex } from 'web3-utils';

@Module({ namespaced: true })
class MetamaskStore extends VuexModule {
    account = '';
    chainId: number | null = null;
    web3: Web3 | null = null;

    get isConnected() {
        return !!this.account;
    }

    @Mutation
    setAccount({ accounts, currentAccount }: { accounts: string[]; currentAccount?: string }) {
        if (!accounts) {
            this.account = '';
            sessionStorage.removeItem('thx:wallet:metamask:currentAccount');
            return;
        }

        const keepAccount = currentAccount || this.account;
        if (!this.account || !keepAccount || !accounts.includes(keepAccount)) {
            this.account = accounts.includes(keepAccount) ? keepAccount : accounts[0];
            sessionStorage.setItem('thx:wallet:metamask:currentAccount', this.account);
        }
    }

    @Mutation
    setChainId(chainId: number) {
        this.chainId = chainId;
    }

    @Mutation
    setWeb3(web3: Web3) {
        this.web3 = web3;
    }

    @Action
    async connect(currentAccount = '') {
        const provider = (window as any).ethereum || ((window as any).web3 && (window as any).web3.currentProvider);
        try {
            if (provider.request) {
                const accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });
              
                this.context.commit('setAccount', { accounts, currentAccount });

                const chainId = await provider.request({ method: 'eth_chainId' });
                this.context.commit('setChainId', parseInt(chainId, 16));

                provider.on('accountsChanged', (accounts: string[]) => {
                    this.context.commit('setAccount', accounts);
                });

                provider.on('chainChanged', (chainId: string) => {
                    this.context.commit('setChainId', parseInt(chainId, 16));
                });

                this.context.commit('setWeb3', new Web3(provider));
            }
        } catch (err) {
            if ((err as any).code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        }
    }

    @Action
    checkPreviouslyConnected() {
        if (this.isConnected) {
            // Already connected
            return;
        }

        const currentAccount = sessionStorage.getItem('thx:wallet:metamask:currentAccount') as string;
        if (currentAccount) {
            this.context.dispatch('connect', currentAccount);
        }
    }

    @Action
    requestSwitchNetwork(chainId: number) {
        const provider = this.web3?.currentProvider as any;
        provider?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: toHex(chainId) }],
        });
    }
}

export default MetamaskStore;
