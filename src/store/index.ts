import { Vue } from 'vue-property-decorator';
import Vuex from 'vuex';
import BN from 'bn.js';
import { IRewardPools, RewardPool } from '../models/RewardPool';

Vue.use(Vuex);

export interface State {
  rewardPools: IRewardPools;
  rewardRules: any[];
  rewards: any[];
  transactions: any[];
  accounts: any[];
  profiles: any[];
  networks: any[];
  balance: {
      eth: BN;
      token: BN;
      tokenRinkeby: BN;
  };
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
    tokenRinkebyBalance: (s: any) => {
        return s.balance.tokenRinkeby;
    },
    tokenBalance: (s: any) => {
        return s.balance.token;
    },
    ethRinkebyBalance: (s: any) => {
        return s.balance.eth;
    },
    rewardPools: (s: any) => {
        return s.rewardPools;
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
        Vue.delete(state.rewardPools, address);
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
