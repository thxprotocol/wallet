import { Vue } from 'vue-property-decorator';
import Vuex from 'vuex';
import BN from 'bn.js';
import { IRewardPools, RewardPool } from '../models/RewardPool';
import { IRewards, Reward } from '../models/Reward';
import { IRewardRules } from '@/models/RewardRule';

Vue.use(Vuex);

export interface State {
    rewardPools: IRewardPools;  // Index by address
    rewardRules: IRewardRules; // Index by pool and ID
    rewards: IRewards; // Index by address
    transactions: any[];  // Index by tx hash
    balance: any;
    // balance: {
    //     eth: BN,
    //     token: BN,
    //     tokenRinkeby: BN,
    // }
}

const state: State = {
    rewardPools: {},
    rewardRules: {},
    rewards: {},
    transactions: [],
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
    rewardPools: (store: State) => {
        return store.rewardPools;
    },
    rewardRules: (store: State) => {
        return store.rewardRules;
    },
    rewards: (store: State) => {
        return store.rewards;
    },
};

const mutations = {
    updateBalance: (store: State, options: { type: string, balance: BN }) => {
        store.balance[options.type] = options.balance;
    },
    addRewardPool: (store: State, pool: RewardPool) => {
        Vue.set(store.rewardPools, pool.address, pool);
    },
    removeRewardPool: (store: State, address: string) => {
        Vue.delete(store.rewardPools, address);
    },
    addRewardToPool: (store: State, data: { reward: Reward, pool: RewardPool}) => {
        Vue.set(store.rewardPools[data.pool.address].rewards, data.reward.address, data.reward);
    },
    updateReward: (store: State, address: string) => {
        Vue.delete(store.rewards, address);
    },
    addRewardRule: (store: State, rewardRule: Reward) => {
        Vue.set(store.rewardRules, rewardRule.id, rewardRule);
    },
    updateRewardRule: (store: State, id: number) => {
        Vue.delete(store.rewardRules, id);
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
