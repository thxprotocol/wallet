import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';

import { RewardPool } from '@/models/RewardPool';
import PoolService from '@/services/PoolService';
import firebase from '@/firebase';

export interface PoolsModuleState {
    all: { [key: string]: RewardPool };
}

const poolService = new PoolService();

@Module({ namespaced: true })
class PoolsModule extends VuexModule implements PoolsModuleState {
    public all: { [key: string]: RewardPool } = {};

    get find() {
        return (id: string) => {
            return this.all[id];
        };
    }

    get allWithMembership() {
        return Object.values(this.all).filter((pool) => pool.isMember);
    }

    @Mutation
    public setPool(pool: RewardPool) {
        Vue.set(this.all, pool.address, pool);
    }

    @Action({ commit: 'setPool' })
    public async loadByAddress(address: string) {
        let pool = this.find(address);

        if (!pool) {
            pool = await poolService.getRewardPool(address);
            await pool.checkMemberships();
        }

        return pool;
    }

    @Action
    public async init(user: firebase.User) {
        const poolRef = firebase.db.ref(`users/${user.uid}/pools`);

        poolRef.on('child_added', async (s: any) => {
            let pool = this.find(s.key);

            if (!pool) {
                pool = await poolService.getRewardPool(s.key);
                await pool.checkMemberships();
                this.context.commit('setPool', pool);
            }

            if (pool.isMember) {
                firebase.db.ref(`/pools/${s.key}/members/${user.uid}`).update({ uid: user.uid });
            }

            if (pool.isManager) {
                firebase.db.ref(`/pools/${s.key}/managers/${user.uid}`).update({ uid: user.uid });
            }
        });

        poolRef.on('child_removed', async (s: any) => {
            const pool = await poolService.getRewardPool(s.key);

            await pool.checkMemberships();

            firebase.db.ref(`/pools/${s.key}/members/${user.uid}`).remove();
            firebase.db.ref(`/pools/${s.key}/managers/${user.uid}`).remove();

            this.context.commit('removeRewardPool', pool);
        });
    }
}

export default PoolsModule;
