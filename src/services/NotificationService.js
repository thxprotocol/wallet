// import firebase from 'firebase/app';
// import 'firebase/database';

import EventService from './EventService';

export default class NotificationService {
    constructor() {
        const THX = window.THX;
        const pool = THX.ns.instances.pool;

        this.ea = new EventService();

        pool.events.RewardStateChanged({}, (error, event) => this.onRewardStateChanged(event.returnValues));
        pool.events.RewardStateChanged({filter: { beneficiary: THX.ns.account.address }}, (error, event) => this.onMyRewardStateChanged(event.returnValues));

        pool.events.RuleStateChanged({}, (error, event) => this.onRuleStateChanged(event.returnValues));
        pool.events.Deposited({}, (error, event) => this.onDeposited(event.returnValues));
        pool.events.Withdrawn({}, (error, event) => this.onWithdrawn(event.returnValues));
    }

    onMyRewardStateChanged(reward) {
        return this.ea.dispatch('event.MyRewardStateChanged', reward);
    }

    onRewardStateChanged(reward) {
        return this.ea.dispatch('event.RewardStateChanged', reward);
    }

    onRuleStateChanged(rule) {
        return this.ea.dispatch('event.RuleStateChanged', rule);
    }

    onDeposited(deposit) {
        return this.ea.dispatch('event.Deposited', deposit);
    }

    onWithdrawn(withdrawel) {
        return this.ea.dispatch('event.Withdrawn', withdrawel);
    }

}
