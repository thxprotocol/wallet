import Vuex, { ActionContext } from 'vuex';
import { Vue } from 'vue-property-decorator';
import { config } from 'vuex-module-decorators';

// Set rawError to true by default on all @Action decorators
config.rawError = true;

import AccountStore from './modules/account';
import NetworkStore from './modules/network';
import AssetPoolStore from './modules/assetPools';
import MembershipStore from './modules/memberships';
import ERC20Store from './modules/erc20';
import WithdrawalStore from './modules/withdrawals';
import PromoCodeStore from './modules/promocodes';
import DepositStore from './modules/deposits';

Vue.use(Vuex);

const mutations = {};
const actions = {
    initialize(context: any) {
        console.log(context.getters['account/user']);
        // if ( && false) {
        //     context.dispatch('account/getProfile');
        // }
    },
};
const getters = {};
const modules = {
    account: AccountStore,
    network: NetworkStore,
    assetpools: AssetPoolStore,
    memberships: MembershipStore,
    erc20: ERC20Store,
    withdrawals: WithdrawalStore,
    promocodes: PromoCodeStore,
    deposits: DepositStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
