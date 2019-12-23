import EventAggregator from './EventAggregator';

const THX = window.THX;

export default class EventService extends EventAggregator {
    public token: any;
    public poolEvents: string[];

    constructor() {
        super();

        this.token = THX.network.instances.token;

        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        const address = THX.network.account.address;
        const addressRinkeby = THX.network.rinkeby.account.address;

        // All my loom token transfers
        this.token.events.Transfer({ to: address }, (error: string, event: any) => this.dispatch('event.Transfer', event.returnValues));
        this.token.events.Transfer({ from: address }, (error: string, event: any) => this.dispatch('event.Transfer', event.returnValues));

        // All my rinkeby token transfers
        tokenRinkeby.events.Transfer({ to: addressRinkeby }, (error: string, event: any) => this.dispatch('event.RinkebyTransfer', event.returnValues));
        tokenRinkeby.events.Transfer({ from: addressRinkeby }, (error: string, event: any) => this.dispatch('event.RinkebyTransfer', event.returnValues));

        this.poolEvents = [
            'Deposited',
            'ManagerAdded',
            'ManagerRemoved',
            'MemberAdded',
            'MemberRemoved',
            // 'RewardPollCreated',
            // 'RewardPollFinished',
            'RulePollCreated',
            'RulePollFinished',
            'RuleStateChanged',
            'Withdrawn'
        ];
    }

    subscribePoolEvents(events: string[]) {
        for (let e of this.poolEvents) {
            events[e]({}, (error: string, event: any) => this.dispatch(`event.${e}`, event.returnValues));
        }
    }

    subscribeRewardEvents(events: any) {
        events.RewardStateChanged({}, (error: string, event: any) => this.dispatch(`event.RewardStateChanged`, event.returnValues));
    }
}
