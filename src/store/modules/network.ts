import Web3 from 'web3';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { isPrivateKey, MINIMUM_GAS_LIMIT } from '@/utils/network';
import { HARDHAT_RPC, NODE_ENV, POLYGON_MUMBAI_RPC, POLYGON_RPC } from '@/utils/secrets';
import { fromWei, toWei } from 'web3-utils';
import { ChainId } from '@/types/enums/ChainId';
import { toHex, toChecksumAddress } from 'web3-utils';
import { getPrivateKeyForUser } from '@/utils/torus';
import { User } from 'oidc-client-ts';
import { chainInfo } from '@/utils/chains';
import { ChainInfo } from '@/types/ChainInfo';
import { AccountVariant } from '@/types/Accounts';
import { soliditySha3 } from 'web3-utils';
import { default as defaultPoolDiamondAbi } from '@thxnetwork/artifacts/dist/exports/abis/defaultPoolDiamond.json';

export type TNetworkConfig = {
    chainId: ChainId;
    privateKey: string;
};

export type TNetworks = {
    [ChainId.BinanceSmartChain]: Web3;
    [ChainId.Ethereum]: Web3;
    [ChainId.Arbitrum]: Web3;
    [ChainId.Hardhat]: Web3;
    [ChainId.PolygonMumbai]: Web3;
    [ChainId.Polygon]: Web3;
};

const networks = {
    [ChainId.BinanceSmartChain]: '',
    [ChainId.Ethereum]: '',
    [ChainId.Arbitrum]: '',
    [ChainId.Hardhat]: HARDHAT_RPC,
    [ChainId.PolygonMumbai]: POLYGON_MUMBAI_RPC,
    [ChainId.Polygon]: POLYGON_RPC,
};

const ethereum = (window as any).ethereum;
const isMetamaskInstalled = typeof ethereum !== undefined;

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    web3: Web3 = new Web3(networks[ChainId.Polygon]);
    privateKey = '';
    address = '';
    _chainId: ChainId | null = null;

    get chainId() {
        const sub = this.context.rootGetters['account/user'].profile.sub;
        const chainId = Number(localStorage.getItem(`thx:wallet:chain-id:${sub}`));
        if (chainId && chainId !== this._chainId) return chainId;
        return this._chainId;
    }

    get chains() {
        return Object.values(chainInfo)
            .filter((chain: ChainInfo) => {
                if (NODE_ENV === 'production' && chain.chainId === ChainId.Hardhat) return;
                if (!chain.disabled) return chain;
            })
            .sort((a: ChainInfo, b: ChainInfo) => {
                return a.name > b.name ? 1 : -1;
            });
    }

    @Mutation
    setWeb3({ web3, privateKey }: { web3: Web3; privateKey?: string }) {
        this.web3 = web3;

        if (privateKey) {
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;
            this.address = toChecksumAddress(account.address);
        }
    }

    @Mutation
    setAddress(address: string) {
        this.address = toChecksumAddress(address);
    }

    @Mutation
    setChainId({ sub, chainId }: { sub: string; chainId: ChainId }) {
        this._chainId = chainId;
        localStorage.setItem(`thx:wallet:chain-id:${sub}`, String(chainId));
    }

    @Mutation
    setPrivateKey(privateKey: string) {
        this.privateKey = privateKey;
    }

    @Action({ rawError: true })
    async getPrivateKey(user: User) {
        this.context.commit('setPrivateKey', await getPrivateKeyForUser(user));
    }

    @Action({ rawError: true })
    async connect(chainId: ChainId) {
        const user = this.context.rootGetters['account/user'];
        const isValidPrivateKey = this.privateKey && isPrivateKey(this.privateKey);
        const isMetamaskAccount = user.profile.variant === AccountVariant.Metamask;
        const web3 =
            isMetamaskAccount && isMetamaskInstalled
                ? // Bind window.ethereum as provider
                  new Web3(ethereum)
                : // Use a local web3 instance as per requested chainId
                  new Web3(networks[chainId]);

        // If private key is not available for a non Metamask account then fetch one from Torus
        if (!isMetamaskAccount && !isValidPrivateKey) {
            await this.context.dispatch('getPrivateKey', user);
        }

        // If metamask is available for metamask account request to switch chain if required
        if (isMetamaskAccount && isMetamaskInstalled) {
            await this.context.dispatch('requestSwitchChain', chainId);
        }

        this.context.commit('setChainId', { sub: user.profile.sub, chainId });
        this.context.commit('setWeb3', { web3, privateKey: this.privateKey });
    }

    @Action({ rawError: true })
    async requestSwitchChain(chainId: ChainId) {
        const profile = this.context.rootGetters['account/user'].profile;

        try {
            const [account] = await ethereum.request({ method: 'eth_requestAccounts' });
            this.context.commit('setAddress', account);

            if (this.address !== profile.address) {
                throw new Error(
                    `Selected Metamask account ${this.address} does not equal the account used during signup.`,
                );
            } else {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: toHex(chainId) }],
                });
            }
        } catch (error) {
            if ((error as { code: number }).code === 4001) {
                throw new Error(`Please connect Metamask account ${profile.address}`);
            } else {
                throw error;
            }
        }
    }

    @Action({ rawError: true })
    async sign({ poolAddress, name, params }: { poolAddress: string; name: string; params: any[] }) {
        if (!this.web3) return;
        const solution = new this.web3.eth.Contract(defaultPoolDiamondAbi as any, poolAddress, {
            from: this.address,
        });
        const abi: any = defaultPoolDiamondAbi.find(fn => fn.name === name);
        const nonce = Number(await solution.methods.getLatestNonce(this.address).call()) + 1;
        const call = this.web3.eth.abi.encodeFunctionCall(abi, params);
        const hash = soliditySha3(call, nonce) || '';

        if (this.privateKey) {
            const sig = this.web3.eth.accounts.sign(hash, this.privateKey).signature;
            return { call, nonce, sig };
        } else {
            const provider = this.web3?.currentProvider as any;
            const sig = await provider.request({
                method: 'eth_sign',
                params: [this.address, hash],
            });
            return { call, nonce, sig };
        }
    }

    @Action({ rawError: true })
    async send({ to, fn }: { to: string; fn: any }) {
        if (!this.web3) return;

        const user = this.context.rootGetters['account/user'];
        const gasPrice = await this.web3.eth.getGasPrice();
        const [from] = await this.web3.eth.getAccounts();
        const data = fn.encodeABI();
        const estimate = await fn.estimateGas();
        const gas = String(estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate);
        const isMetamaskAccount = user.profile.variant === AccountVariant.Metamask;

        if (this.privateKey) {
            const sig = await this.web3.eth.accounts.signTransaction(
                {
                    gas,
                    gasPrice,
                    to,
                    from,
                    data,
                },
                this.privateKey,
            );

            if (sig.rawTransaction) {
                return await this.web3.eth.sendSignedTransaction(sig.rawTransaction);
            }
        } else if (isMetamaskAccount && isMetamaskInstalled) {
            try {
                return await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            gas,
                            gasPrice,
                            to,
                            from,
                            data,
                        },
                    ],
                });
            } catch (error) {
                // TODO Check for error.code and return appropriately
                console.error(error);
            }
        } else {
            throw new Error('Please sign in again or install Metamask to use this account.');
        }
    }

    @Action({ rawError: true })
    async sendValue({ web3, to, amount }: { web3: Web3; to: string; amount: string }) {
        const value = toWei(amount);
        const gas = await web3.eth.estimateGas({ to, value });
        const tx = await web3.eth.sendTransaction({ gas, to, value });

        return { tx };
    }

    @Action({ rawError: true })
    async getBalance() {
        const profile = this.context.rootGetters['account/profile'];
        return Number(fromWei(await this.web3.eth.getBalance(profile.address)));
    }
}

export default NetworkModule;
