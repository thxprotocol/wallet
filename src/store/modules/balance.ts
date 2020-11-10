import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { account, checkInclusion, config, maticPOSClient } from '@/utils/network';

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
            // const rootWeb3 = new Web3(ROOT_RPC);
            // const erc20Contract = new ethers.Contract(config.root.DERC20, ERC20_ABI, account);
            // const erc20Balance = await erc20Contract.balanceOf(account.address);
            // const ethBalance = await rootWeb3.eth.getBalance(account.address);
            // this.context.commit('updateRootBalance', { type: 'erc20', balance: erc20Balance });
            // this.context.commit('updateRootBalance', { type: 'eth', balance: ethBalance });
        })();

        return await (async () => {
            // const erc20Contract = new ethers.Contract(config.child.DERC20, ERC20_ABI, account);
            // const erc20Balance = await erc20Contract.balanceOf(account.address);
            // const maticContract = new ethers.Contract(config.child.MATIC, ERC20_ABI, account);
            // const maticBalance = await maticContract.balanceOf(account.address);
            // this.context.commit('updateChildBalance', { type: 'erc20', balance: erc20Balance });
            // this.context.commit('updateChildBalance', { type: 'matic', balance: maticBalance });
        })();
    }

    @Action
    async burn(balance: string) {
        try {
            return await maticPOSClient.burnERC20(config.child.DERC20, balance, {
                from: account.address,
            });
        } catch (err) {
            return err;
        }
    }

    @Action
    async exit(txHash: string) {
        return new Promise((resolve, reject) => {
            checkInclusion(txHash)
                .then(() => maticPOSClient.exitERC20(txHash, { from: account.address }))
                .then(tx => resolve(tx))
                .catch(err => {
                    reject(err);
                });
        });
    }

    @Action
    async deposit(balance: string) {
        try {
            await maticPOSClient.approveERC20ForDeposit(config.root.DERC20, balance, {
                from: account.address,
            });

            return await maticPOSClient.depositERC20ForUser(config.root.DERC20, account.address, balance, {
                from: account.address,
                gasPrice: 1e9,
            });
        } catch (err) {
            return err;
        }
    }
}

export default BalanceModule;
