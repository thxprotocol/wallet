import Web3 from 'web3';
import Matic, { MaticPOSClient } from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import ISolutionArtifact from '@/artifacts/contracts/contracts/interfaces/ISolution.sol/ISolution.json';
import { CHILD_RPC, INFURA_KEY, ROOT_RPC } from '@/utils/secrets';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ethers, Wallet } from 'ethers';
import axios from 'axios';

const solutionContract = (address: string, signer: Wallet) =>
    new ethers.Contract(address, ISolutionArtifact.abi, signer);

interface SignCallPayload {
    poolAddress: string;
    name: string;
    args: any[];
    signer: Wallet;
}

export interface QR {
    contract: string;
    assetPoolAddress: string;
    contractAddress: string;
    method: string;
    params: {
        agree: boolean;
        reward_id: number;
        id: number;
        withdrawAmount: number;
        withdrawDuration: number;
    };
}

export const config = {
    root: {
        RPC: `${ROOT_RPC}/${INFURA_KEY}`,
        POSRootChainManager: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74',
        RootChainProxyAddress: '0x2890bA17EfE978480615e330ecB65333b880928e',
        DERC20: '0x655F2166b0709cd575202630952D71E2bB0d61Af',
        posERC20Predicate: '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34',
        posEtherPredicate: '0xe2B01f3978c03D6DdA5aE36b2f3Ac0d66C54a6D5',
    },
    child: {
        RPC: CHILD_RPC,
        DERC20: '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1',
        MaticWETH: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
};

@Module({ namespaced: true })
class NetworkModule extends VuexModule {
    _client!: MaticPOSClient;
    _wallet!: Wallet;
    _provider!: any;

    _root: any = {
        eth: '',
        erc20: '',
    };
    _child: any = {
        matic: '',
        erc20: '',
    };

    get maticWeb3() {
        return this._client.web3Client.getMaticWeb3();
    }

    get parentWeb3() {
        return this._client.web3Client.getParentWeb3();
    }

    get provider() {
        return this._provider;
    }

    get rootERC20(): string {
        return this._root.erc20;
    }

    get childERC20(): string {
        return this._child.erc20;
    }

    get rootETH(): string {
        return this._root.eth;
    }

    get childMATIC(): string {
        return this._child.matic;
    }

    @Mutation
    updateRootBalance({ type, balance }: { type: string; balance: number }) {
        this._root[type] = balance;
    }

    @Mutation
    updateChildBalance({ type, balance }: { type: string; balance: number }) {
        this._child[type] = balance;
    }

    @Mutation
    connect(privateKey: string) {
        this._provider = new ethers.providers.JsonRpcProvider(CHILD_RPC);
        this._wallet = new ethers.Wallet(privateKey, this._provider);
        this._client = new Matic.MaticPOSClient({
            network: 'testnet',
            version: 'mumbai',
            parentProvider: new HDWalletProvider(this._wallet.privateKey, `${ROOT_RPC}/${INFURA_KEY}`),
            maticProvider: new HDWalletProvider(this._wallet.privateKey, CHILD_RPC),
            posRootChainManager: config.root.POSRootChainManager,
            posERC20Predicate: config.root.posERC20Predicate,
            parentDefaultOptions: { from: this._wallet.address },
            maticDefaultOptions: { from: this._wallet.address },
        });
    }

    @Action
    async signCall({ poolAddress, name, args, signer }: SignCallPayload) {
        try {
            const solution = solutionContract(poolAddress, signer);
            const nonce = parseInt(await solution.getLatestNonce(signer.address)) + 1;
            const call = solution.interface.encodeFunctionData(name, args);
            const hash = Web3.utils.soliditySha3(call, nonce) || '';
            const sig = await signer.signMessage(ethers.utils.arrayify(hash));

            await axios({
                url: '/gas_station/call',
                method: 'post',
                headers: {
                    AssetPool: poolAddress,
                },
                data: {
                    call,
                    nonce,
                    sig,
                },
            });
        } catch (e) {
            console.log(e);
            return e;
        }
    }

    @Action
    async upgradeAddress({
        oldAddress,
        newAddress,
        callData,
    }: {
        oldAddress: string;
        newAddress: string;
        callData: SignCallPayload;
    }) {
        try {
            const solution = solutionContract(callData.poolAddress, callData.signer);
            const nonce = parseInt(await solution.getLatestNonce(callData.signer.address)) + 1;
            const call = solution.interface.encodeFunctionData(callData.name, callData.args);
            const hash = Web3.utils.soliditySha3(call, nonce) || '';
            const sig = await callData.signer.signMessage(ethers.utils.arrayify(hash));

            await axios({
                url: '/gas_station/upgrade_address',
                method: 'post',
                headers: {
                    AssetPool: callData.poolAddress,
                },
                data: {
                    oldAddress,
                    newAddress,
                    call,
                    nonce,
                    sig,
                },
            });
        } catch (e) {
            return e;
        }
    }

    @Action
    async checkInclusion(txHash: string) {
        const web3 = new Web3(`${ROOT_RPC}/${INFURA_KEY}`);
        const childWeb3 = this._client.web3Client.getMaticWeb3();
        const txDetails = await childWeb3.eth.getTransactionReceipt(txHash);
        const block = txDetails.blockNumber;

        return new Promise((resolve, reject) => {
            web3.eth.subscribe(
                'logs',
                {
                    address: config.root.RootChainProxyAddress,
                },
                async (error, result) => {
                    if (error) {
                        reject(error);
                    }

                    if (result.data) {
                        const transaction = web3.eth.abi.decodeParameters(
                            ['uint256', 'uint256', 'bytes32'],
                            result.data,
                        );
                        if (block <= transaction['1']) {
                            resolve(result);
                        }
                    }
                },
            );
        });
    }

    @Action
    async init(address: string) {
        try {
            // Loop through the memberships and detect token contracts
            // Get balances for these tokens

            await (async () => {
                const web3 = this._client.web3Client.getParentWeb3();
                const ethBalance = await web3.eth.getBalance(address);
                const erc20Contract = this._client.getERC20TokenContract(config.root.DERC20, true);
                const erc20Balance = await erc20Contract.methods.balanceOf(address).call();

                this.context.commit('updateRootBalance', { type: 'erc20', balance: erc20Balance });
                this.context.commit('updateRootBalance', { type: 'eth', balance: ethBalance });
            })();

            await (async () => {
                const web3 = this._client.web3Client.getMaticWeb3();
                const maticBalance = await web3.eth.getBalance(address);
                const erc20Contract = this._client.getERC20TokenContract(config.child.DERC20);
                const erc20Balance = await erc20Contract.methods.balanceOf(address).call();

                this.context.commit('updateChildBalance', { type: 'erc20', balance: erc20Balance });
                this.context.commit('updateChildBalance', { type: 'matic', balance: maticBalance });
            })();
        } catch (e) {
            return e;
        }
    }

    @Action
    async burn({ address, balance }: { address: string; balance: string }) {
        try {
            return await this._client.burnERC20(config.child.DERC20, balance, {
                from: address,
            });
        } catch (err) {
            return err;
        }
    }

    @Action
    async checkInclusionAndExit({ address, txHash }: { address: string; txHash: string }) {
        return new Promise((resolve, reject) => {
            this.checkInclusion(txHash)
                .then(() => this._client.exitERC20(txHash, { from: address }))
                .then((tx: any) => resolve(tx))
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }

    @Action
    async exit({ address, txHash }: { address: string; txHash: string }) {
        try {
            return await this._client.exitERC20(txHash, { from: address });
        } catch (err) {
            return err;
        }
    }

    @Action
    async deposit({ address, balance }: { address: string; balance: string }) {
        try {
            await this._client.approveERC20ForDeposit(config.root.DERC20, balance, {
                from: address,
            });
            return await this._client.depositERC20ForUser(config.root.DERC20, address, balance, {
                from: address,
                gasPrice: 1e9,
            });
        } catch (err) {
            return err;
        }
    }
}

export default NetworkModule;
