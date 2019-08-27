import EventAggregator from './EventAggregator';

export default class EventService extends EventAggregator {
    constructor() {
        super();

        const THX = window.THX;
        this.token = THX.network.instances.token;

        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        const address = THX.network.account.address;
        const addressRinkeby = THX.network.rinkeby.account.address;

        // All my loom token transfers
        this.token.events.Transfer({ to: address }, (error, event) => this.dispatch('event.Transfer', event.returnValues));
        this.token.events.Transfer({ from: address }, (error, event) => this.dispatch('event.Transfer', event.returnValues));

        // All my rinkeby token transfers
        tokenRinkeby.events.Transfer({ to: addressRinkeby }, (error, event) => this.onTransfer(event.returnValues));
        tokenRinkeby.events.Transfer({ from: addressRinkeby }, (error, event) => this.onTransfer(event.returnValues));

        this.poolEvents = [
            'Deposited',
            'ManagerAdded',
            'ManagerRemoved',
            'MemberAdded',
            'MemberRemoved',
            'RewardPollCreated',
            'RewardPollFinished',
            'RulePollCreated',
            'RulePollFinished',
            'RuleStateChanged',
            'Withdrawn'
        ];
    }

    subscribePoolEvents(events) {
        for (let e of this.poolEvents) {
            events[e]({}, (error, event) => this.dispatch(`event.${e}`, event.returnValues));
        }
    }

    rewardSubscription(events) {
        events.RewardStateChanged({}, (error, event) => this.dispatch(`event.RewardStateChanged`, event.returnValues));
    }
}
