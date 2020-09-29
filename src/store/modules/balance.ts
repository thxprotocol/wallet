import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import Web3 from 'web3';
import { ERC20_ABI } from '@/utils/contracts';
import { checkInclusion, config, maticPOSClient } from '@/utils/network';
import { ADDRESS } from '@/utils/secrets';

const from = ADDRESS;
const rootWeb3 = new Web3(config.root.RPC);
const childWeb3 = new Web3(config.child.RPC);

rootWeb3.defaultAccount = from;
childWeb3.defaultAccount = from;

interface Balance {
    type: string;
    balance: string;
}

@Module({ namespaced: true })
class BalanceModule extends VuexModule {
    _root: any = {
        eth: '',
        matic: '',
        erc20: '',
    };
    _child: any = {
        eth: '',
        matic: '',
        erc20: '',
    };

    get rootERC20(): string {
        return this._root.erc20;
    }

    get childERC20(): string {
        return this._child.erc20;
    }

    get rootETH(): string {
        return this._root.eth;
    }

    get childETH(): string {
        return this._child.eth;
    }

    get rootMATIC(): string {
        return this._root.matic;
    }

    get childMATIC(): string {
        return this._child.matic;
    }

    @Mutation
    updateRootBalance({ type, balance }: Balance) {
        this._root[type] = balance;
    }

    @Mutation
    updateChildBalance({ type, balance }: Balance) {
        this._child[type] = balance;
    }

    @Action
    async init() {
        await (async () => {
            const erc20Contract = new rootWeb3.eth.Contract(ERC20_ABI as any, config.root.DERC20);
            const erc20Balance = await erc20Contract.methods.balanceOf(ADDRESS).call({ from, gas: 6e6 });
            const ethBalance = await rootWeb3.eth.getBalance(ADDRESS);

            this.context.commit('updateRootBalance', { type: 'erc20', balance: erc20Balance });
            this.context.commit('updateRootBalance', { type: 'eth', balance: ethBalance });
        })();

        return await (async () => {
            const erc20Contract = new childWeb3.eth.Contract(ERC20_ABI as any, config.child.DERC20);
            const erc20Balance = await erc20Contract.methods.balanceOf(ADDRESS).call();
            const maticContract = new childWeb3.eth.Contract(ERC20_ABI as any, config.child.MATIC);
            const maticBalance = await maticContract.methods.balanceOf(ADDRESS).call();

            this.context.commit('updateChildBalance', { type: 'erc20', balance: erc20Balance });
            this.context.commit('updateChildBalance', { type: 'matic', balance: maticBalance });
        })();
    }

    @Action
    async burn(balance: string) {
        try {
            return await maticPOSClient.burnERC20(config.child.DERC20, balance, {
                from,
            });
        } catch (err) {
            return err;
        }
    }

    @Action
    async exit(txHash: string) {
        try {
            const result = await checkInclusion(txHash);

            if (result) {
                return await maticPOSClient.exitERC20(txHash, { from });
            }
        } catch (err) {
            return err;
        }
    }

    @Action
    async deposit(balance: string) {
        try {
            await maticPOSClient.approveERC20ForDeposit(config.root.DERC20, balance, {
                from,
            });

            return await maticPOSClient.depositERC20ForUser(config.root.DERC20, ADDRESS, balance, {
                from,
                gasPrice: 1e9,
            });
        } catch (err) {
            return err;
        }
    }
}

export default BalanceModule;
