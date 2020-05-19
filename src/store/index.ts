import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { vuexfireMutations } from 'vuexfire';
import { config } from 'vuex-module-decorators';
// Set rawError to true by default on all @Action decorators
config.rawError = true;

import NotificationsModule from './modules/notifications';
import AccountStore from './modules/account';
import MembersModule from './modules/members';
import PoolsModule from './modules/pools';
import BalanceModule from './modules/balance';

Vue.use(Vuex);

const mutations = {
    ...vuexfireMutations,
};

const actions = {};
const getters = {};

const modules = {
    notifications: NotificationsModule,
    account: AccountStore,
    members: MembersModule,
    pools: PoolsModule,
    balance: BalanceModule,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
