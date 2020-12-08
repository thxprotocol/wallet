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
        erc20: '',
    };
    _child: any = {
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
            const web3 = maticPOSClient.web3Client.getParentWeb3();
            const ethBalance = await web3.eth.getBalance(account.address);
            const erc20Contract = maticPOSClient.getERC20TokenContract(config.root.DERC20, true);
            const erc20Balance = await erc20Contract.methods.balanceOf(account.address).call();

            this.context.commit('updateRootBalance', { type: 'erc20', balance: erc20Balance });
            this.context.commit('updateRootBalance', { type: 'eth', balance: ethBalance });
        })();

        return await (async () => {
            const web3 = maticPOSClient.web3Client.getMaticWeb3();
            const maticBalance = await web3.eth.getBalance(account.address);
            const erc20Contract = maticPOSClient.getERC20TokenContract(config.child.DERC20);
            const erc20Balance = await erc20Contract.methods.balanceOf(account.address).call();

            this.context.commit('updateChildBalance', { type: 'erc20', balance: erc20Balance });
            this.context.commit('updateChildBalance', { type: 'matic', balance: maticBalance });
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
    async checkInclusionAndExit(txHash: string) {
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
    async exit(txHash: string) {
        try {
            return await maticPOSClient.exitERC20(txHash, { from: account.address });
        } catch (err) {
            return err;
        }
    }

    @Action
    async deposit(balance: string) {
        try {
            const tx = await maticPOSClient.approveERC20ForDeposit(config.root.DERC20, balance, {
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
