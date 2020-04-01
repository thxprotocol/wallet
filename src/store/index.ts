import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { Account } from '@/models/Account';
import { IRewardPools, RewardPool } from '../models/RewardPool';
import BN from 'bn.js';

Vue.use(Vuex);

export interface State {
    account: Account | null;
    rewardPools: IRewardPools;
    balance: {
        eth: BN;
        token: BN;
        tokenRinkeby: BN;
    };
}

const state: State = {
    account: null,
    rewardPools: {},
    balance: {
        eth: new BN(0),
        token: new BN(0),
        tokenRinkeby: new BN(0),
    },
};

const getters = {
    tokenRinkebyBalance: (store: State) => {
        return store.balance.tokenRinkeby;
    },
    tokenBalance: (store: State) => {
        return store.balance.token;
    },
    ethRinkebyBalance: (store: State) => {
        return store.balance.eth;
    },
    account: (store: State) => {
        return store.account;
    },
    rewardPools: (store: State) => {
        return store.rewardPools;
    },
};

const mutations = {
    updateBalance: (store: State, options: { type: string; balance: BN }) => {
        (store.balance as any)[options.type] = options.balance;
    },
    addRewardPool: (store: State, pool: RewardPool) => {
        Vue.set(store.rewardPools, pool.address, pool);
    },
    removeRewardPool: (store: State, address: string) => {
        Vue.delete(store.rewardPools, address);
    },
    addAccount: (store: State, account: Account) => {
        Vue.set(store, 'account', account);
    },
    updateAccount: (store: State, options: { prop: string; val: any }) => {
        if (store.account) {
            Vue.set(store.account, options.prop, options.val);
        }
    },
};

const actions = {};
const modules = {};

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    modules,
});
