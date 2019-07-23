import EventService from './EventService';

export default class NotificationService {
    constructor() {
        const THX = window.THX;
        const pool = THX.contracts.instances.pool;
        const token = THX.contracts.instances.token;

        this.ea = new EventService();

        pool.events.RewardStateChanged({}, (error, event) => this.onRewardStateChanged(event.returnValues));
        pool.events.RewardStateChanged({filter: { beneficiary: THX.contracts.currentUserAddress }}, (error, event) => this.onMyRewardStateChanged(event.returnValues));

        pool.events.RuleStateChanged({}, (error, event) => this.onRuleStateChanged(event.returnValues));
        pool.events.Deposited({}, (error, event) => this.onDeposited(event.returnValues));
        pool.events.Withdrawn({}, (error, event) => this.onWithdrawn(event.returnValues));

        token.events.Transfer({ to: THX.contracts.currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));
        token.events.Transfer({ from: THX.contracts.currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));
    }

    onTransfer(transfer) {
        return this.ea.dispatch('event.Transfer', transfer);
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
