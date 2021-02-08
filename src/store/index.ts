import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { config } from 'vuex-module-decorators';

// Set rawError to true by default on all @Action decorators
config.rawError = true;

import AccountStore from './modules/account';
import NetworkStore from './modules/network';
import MembershipStore from './modules/memberships';

Vue.use(Vuex);

const mutations = {};
const actions = {};
const getters = {};
const modules = {
    account: AccountStore,
    network: NetworkStore,
    memberships: MembershipStore,
};

export default new Vuex.Store({
    state: {},
    getters,
    mutations,
    actions,
    modules,
});
