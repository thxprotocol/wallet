import Vuex from 'vuex';
import { Vue } from 'vue-property-decorator';
import { RewardPool } from '@/models/RewardPool';
import { Notification } from '@/models/Notification';
import { vuexfireMutations } from 'vuexfire';
import BN from 'bn.js';

Vue.use(Vuex);

const getters = {
    tokenRinkebyBalance: (store: any) => {
        return store.balance.tokenRinkeby;
    },
    tokenBalance: (store: any) => {
        return store.balance.token;
    },
    ethRinkebyBalance: (store: any) => {
        return store.balance.eth;
    },
    rewardPools: (store: any) => {
        return store.rewardPools;
    },
    notifications: (store: any) => {
        return store.notifications;
    },
};

const mutations = {
    updateBalance: (store: any, options: { type: string; balance: BN }) => {
        (store.balance as any)[options.type] = options.balance;
    },
    addRewardPool: (store: any, pool: RewardPool) => {
        Vue.set(store.rewardPools, pool.address, pool);
    },
    removeRewardPool: (store: any, address: string) => {
        Vue.delete(store.rewardPools, address);
    },
    setNotification: (store: any, notification: Notification) => {
        Vue.set(store.notifications, notification.key, notification);
    },
    deleteNotification: (store: any, key: string) => {
        Vue.delete(store.notifications, key);
    },
    ...vuexfireMutations,
};

const actions = {};
const modules = {};

export default new Vuex.Store({
    state: {
        rewardPools: {},
        notifications: {},
        balance: {
            eth: new BN(0),
            token: new BN(0),
            tokenRinkeby: new BN(0),
        },
    },
    getters,
    mutations,
    actions,
    modules,
});
