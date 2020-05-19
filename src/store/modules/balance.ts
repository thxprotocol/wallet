import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import BN from 'bn.js';
import CoinService from '@/services/CoinService';
import NetworkService from '@/services/NetworkService';
import { Vue } from 'vue-property-decorator';

export interface BalanceModuleState {
    eth: BN;
    token: BN;
    tokenRinkeby: BN;
}

@Module({ namespaced: true })
class BalanceModule extends VuexModule implements BalanceModuleState {
    public eth = new BN(0);
    public token = new BN(0);
    public tokenRinkeby = new BN(0);

    @Mutation
    public update(options: { type: string; balance: BN }) {
        Vue.set(this, options.type, options.balance);
    }

    @Action
    public async init([networkService, coinService]: [NetworkService, CoinService]) {
        coinService.listen();
        const extdevBalance = await coinService.getExtdevBalance(networkService.extdev.account);
        const rinkebyBalance = await coinService.getRinkebyBalance(networkService.rinkeby.account.address);
        const ethBalance = await coinService.getEthBalance(networkService.rinkeby.account.address);

        this.context.commit('update', { type: 'eth', balance: ethBalance });
        this.context.commit('update', { type: 'token', balance: extdevBalance });
        this.context.commit('update', { type: 'tokenRinkeby', balance: rinkebyBalance });
    }
}

export default BalanceModule;
