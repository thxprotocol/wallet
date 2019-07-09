import firebase from 'firebase/app';
import EventService from './EventService';

export default class NotificationService {
    constructor() {
        this.ea = new EventService();

        const THX = window.THX;
        const pool = THX.ns.instances.pool;

        pool.events.RewardStateChange({}, (error, event) => {
            const reward = event.returnValues;
            this.ea.dispatch('event.RewardStateChange', reward);
        });

        pool.events.RuleStateChange({}, (error, event) => {
            const rule = event.returnValues;
            this.ea.dispatch('event.RuleStateChange', rule);
        });

        pool.events.Deposited({}, (error, event) => {
            const deposit = event.returnValues;
            this.ea.dispatch('event.Deposited', deposit);

        });

        pool.events.Withdrawn({}, (error, event) => {
            const withdrawel = event.returnValues;
            this.ea.dispatch('event.Withdrawn', withdrawel);
        });
    }
}
