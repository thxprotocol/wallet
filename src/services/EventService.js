import EventAggregator from './EventAggregator';

export default class EventService extends EventAggregator {
    constructor() {
        super();

        const THX = window.THX;
        const token = THX.network.instances.token;
        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        const address = THX.network.account.address;
        const addressRinkeby = THX.network.rinkeby.account.address;

        // All my loom token transfers
        token.events.Transfer({ to: address }, (error, event) => this.onTransfer(event.returnValues));
        token.events.Transfer({ from: address }, (error, event) => this.onTransfer(event.returnValues));

        // All my rinkeby token transfers
        tokenRinkeby.events.Transfer({ to: addressRinkeby }, (error, event) => this.onTransfer(event.returnValues));
        tokenRinkeby.events.Transfer({ from: addressRinkeby }, (error, event) => this.onTransfer(event.returnValues));
    }

    rewardPoolSubscription(events) {
        events.Deposited({}, (error, event) => this.onDeposited(event.returnValues));
        events.ManagerAdded({}, (error, event) => this.onManagerAdded(event.returnValues));
        events.ManagerRemoved({}, (error, event) => this.onManagerRemoved(event.returnValues));
        events.MemberAdded({}, (error, event) => this.onMemberAdded(event.returnValues));
        events.MemberRemoved({}, (error, event) => this.onMemberRemoved(event.returnValues));
        events.RewardPollCreated({}, (error, event) => this.onRewardPollCreated(event.returnValues));
        events.RewardPollFinished({}, (error, event) => this.onRewardPollFinished(event.returnValues));
        events.RulePollCreated({}, (error, event) => this.onRulePollCreated(event.returnValues));
        events.RulePollFinished({}, (error, event) => this.onRulePollFinished(event.returnValues));
        events.RuleStateChanged({}, (error, event) => this.onRuleStateChanged(event.returnValues));
        events.Withdrawn({}, (error, event) => this.onWithdrawn(event.returnValues));
    }

    rewardSubscription(events) {
        events.RewardStateChanged({}, (error, event) => this.onRewardStateChanged(event.returnValues));
    }

    onTransfer(transfer) {
        return this.dispatch('event.Transfer', transfer);
    }

    onDeposited(data) {
        return this.dispatch('event.Deposited', data);
    }

    onManagerAdded(data) {
        return this.dispatch('event.ManagerAdded', data);
    }

    onManagerRemoved(data) {
        return this.dispatch('event.ManagerRemoved', data);
    }

    onMemberAdded(data) {
        return this.dispatch('event.MemberAdded', data);
    }

    onMemberRemoved(data) {
        return this.dispatch('event.MemberRemoved', data);
    }

    onRewardPollCreated(data) {
        return this.dispatch('event.RewardPollCreated', data);
    }

    onRewardPollFinished(data) {
        return this.dispatch('event.RewardPollFinished', data);
    }

    onRulePollCreated(data) {
        return this.dispatch('event.RulePollCreated', data);
    }

    onRulePollFinished(data) {
        return this.dispatch('event.RulePollFinished', data);
    }

    onRuleStateChanged(data) {
        return this.dispatch('event.RuleStateChanged', data);
    }

    onWithdrawn(data) {
        return this.dispatch('event.Withdrawn', data);
    }
}
