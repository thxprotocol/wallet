import { Vue } from 'vue-property-decorator';
import Vuex from 'vuex';
import BN from 'bn.js';
import { RewardPool } from '../models/RewardPool';

Vue.use(Vuex);

export interface State {
  rewardPools: any;
  rewardRules: any[];
  rewards: any[];
  transactions: any[],
  accounts: any[],
  profiles: any[],
  networks: any[],
  balance: {
      eth: BN;
      token: BN;
      tokenRinkeby: BN;
  },
}

const state: State = {
    rewardPools: {},
    rewardRules: [],
    rewards: [],
    transactions: [],
    accounts: [],
    profiles: [],
    networks: [],
    balance: {
        eth: new BN(0),
        token: new BN(0),
        tokenRinkeby: new BN(0),
    },
};

const getters = {
    tokenRinkebyBalance: (state: any) => {
        return state.balance.tokenRinkeby;
    },
    tokenBalance: (state: any) => {
        return state.balance.token;
    },
    ethRinkebyBalance: (state: any) => {
        return state.balance.eth;
    },
    rewardPools: (state: any) => {
        return state.rewardPools;
    },
};

const mutations = {
    updateBalance: (state: any, options: { type: string, balance: BN }) => {
        state.balance[options.type] = options.balance;
    },
    addRewardPool: (state: any, pool: RewardPool) => {
        Vue.set(state.rewardPools, pool.address, pool);
    },
    removeRewardPool: (state: any, address: string) => {
        Vue.set(state.rewardPools, address, null);
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
