import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import Web3 from 'web3';
import { TOKEN_ABI } from '@/utils/contracts';
import { config, maticPOSClient } from '@/network';

const from = config.user.address;

@Module({ namespaced: true })
class BalanceModule extends VuexModule {
    _balances: any = {
        root: '',
        child: '',
        eth: '',
    };

    get rootBalance(): string {
        return new Web3().utils.fromWei(this._balances.root);
    }

    get childBalance(): string {
        return new Web3().utils.fromWei(this._balances.child);
    }

    get ethBalance(): string {
        return new Web3().utils.fromWei(this._balances.eth);
    }

    @Mutation
    update({ network, balance }: { network: string; balance: string }) {
        this._balances[network] = balance;
    }

    @Action
    async init() {
        const rootWeb3 = new Web3(config.root.RPC);
        const rootTokenContract = new rootWeb3.eth.Contract(TOKEN_ABI, config.root.DERC20);
        const rootBalance = await rootTokenContract.methods.balanceOf(from).call({ from });
        const ethBalance = await rootWeb3.eth.getBalance(config.user.address);

        this.context.commit('update', { network: 'root', balance: rootBalance });
        this.context.commit('update', { network: 'eth', balance: ethBalance });

        const childWeb3 = new Web3(config.child.RPC);
        const childTokenContract = new childWeb3.eth.Contract(TOKEN_ABI, config.child.DERC20);
        const childBalance = await childTokenContract.methods.balanceOf(from).call({ from });

        this.context.commit('update', { network: 'child', balance: childBalance });
    }

    @Action
    async withdraw(balance: string) {
        try {
            const txBurn = await maticPOSClient.burnERC20(config.child.DERC20, balance, {
                from: config.user.address,
            });
            const txExit = await maticPOSClient.exitERC20(txBurn.transactionHash, { from: config.user.address });

            return txExit;
        } catch (err) {
            console.error(err);
        }
    }

    @Action
    async deposit(balance: string) {
        try {
            await maticPOSClient.approveERC20ForDeposit(config.root.DERC20, balance, {
                from: config.user.address,
            });
            const txDeposit = await maticPOSClient.depositERC20ForUser(
                config.root.DERC20,
                config.user.address,
                balance,
                {
                    from: config.user.address,
                    gasPrice: '10000000000',
                },
            );

            return txDeposit;
        } catch (err) {
            console.error(err);
        }
    }
}

export default BalanceModule;
