import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Vue } from 'vue-property-decorator';

import firebase from '@/firebase';

import { Notification } from '@/models/Notification';

export interface NotificationsState {
    all: any;
    allResolved: Notification[];
}

@Module({ namespaced: true })
class NotificationsModule extends VuexModule implements NotificationsState {
    public all: any = {};
    private userRef: any;

    @Mutation
    public setNotification(notification: any) {
        Vue.set(this.all, notification.id, notification);
    }

    @Mutation
    public deleteNotification(key: string) {
        Vue.delete(this.all, key);
    }

    get allResolved() {
        const getters = this.context.rootGetters;
        return Object.values(this.all).map((notification: any) => {
            return new Notification(
                getters['pools/find'](notification.poolAddress),
                notification.address,
                notification.id,
                getters['members/findByAddress'](notification.memberAddress),
                notification.removed,
                notification,
            );
        });
    }

    get count() {
        return Object.keys(this.all).length;
    }

    @Action
    public init(user: any) {
        this.userRef = firebase.db.ref(`users/${user.uid}`);

        this.userRef.child('notifications').on('child_added', async (s: any) => {
            const isRemoved = s.val().removed;
            if (!isRemoved) {
                const snap = await firebase.db.ref(`pools/${s.val().pool}/notifications/${s.key}`).once('value');
                const notification = {
                    removed: s.val().removed,
                    memberAddress: snap.val().address,
                    poolAddress: s.val().pool,
                    id: snap.key,
                    ...snap.val(),
                };
                await this.context.dispatch('members/loadByAddress', notification.memberAddress, { root: true });
                await this.context.dispatch('pools/loadByAddress', notification.poolAddress, { root: true });
                this.context.commit('setNotification', notification);
            }
        });

        this.userRef.child('notifications').on('child_changed', async (snap: any) => {
            if (snap.val().removed) {
                this.context.commit('deleteNotification', snap.key);
            }
        });
    }
}
export default NotificationsModule;
