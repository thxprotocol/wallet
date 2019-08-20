import EventAggregator from './EventAggregator';
import RewardPool from '../contracts/RewardPool.json';
import RulePoll from '../contracts/RulePoll.json';
import Reward from '../contracts/Reward.json';

export default class EventService extends EventAggregator {
    constructor() {
        super();
    }

    async init(pools) {
        const THX = window.THX;
        const token = THX.network.instances.token;
        const tokenRinkeby = THX.network.instances.tokenRinkeby;
        const address = THX.network.account.address;
        debugger
        // Get pools
        for (let poolAddress in pools) {
            const pool = await THX.network.contract(RewardPool, poolAddress);
            const amount = await pool.methods.countRewards().call();
            debugger
            // eslint-disable-next-line
            console.info(`Subscribing for Events on ${amount} Reward Contracts.`);

            // Get all rewards for the pool that need listening
            // for (var i = 0; i < amount; i++) {
            //     const rewardAddress = await pool.methods.rewards(i).call();
            //     const reward = THX.network.contract(Reward, rewardAddress);
            //
            //     reward.events.RewardStateChanged({}, (error, event) => this.onRewardStateChanged(event.returnValues));
            //     reward.events.RewardStateChanged({filter: { beneficiary: address }}, (error, event) => this.onMyRewardStateChanged(event.returnValues));
            // }

            pool.events.RewardPollCreated({}, (error, event) => this.onRewardPollCreated(event.returnValues));
            pool.events.RuleStateChanged({}, (error, event) => this.onRuleStateChanged(event.returnValues));
            pool.events.Deposited({}, (error, event) => this.onDeposited(event.returnValues));
            pool.events.Withdrawn({}, (error, event) => this.onWithdrawn(event.returnValues));
        }

        token.events.Transfer({ to: address }, (error, event) => this.onTransfer(event.returnValues));
        token.events.Transfer({ from: address }, (error, event) => this.onTransfer(event.returnValues));

        tokenRinkeby.events.Transfer({ to: address }, (error, event) => this.onTransfer(event.returnValues));
        tokenRinkeby.events.Transfer({ from: address }, (error, event) => this.onTransfer(event.returnValues));
    };

    onTransfer(transfer) {
        return this.dispatch('event.Transfer', transfer);
    }

    onMyRewardStateChanged(reward) {
        return this.dispatch('event.MyRewardStateChanged', reward);
    }

    onRewardPollCreated(reward) {
        return this.dispatch('event.RewardPollCreated', reward);
    }

    onRewardStateChanged(reward) {
        return this.dispatch('event.RewardStateChanged', reward);
    }

    onRuleStateChanged(rule) {
        return this.dispatch('event.RuleStateChanged', rule);
    }

    onDeposited(deposit) {
        return this.dispatch('event.Deposited', deposit);
    }

    onWithdrawn(withdrawel) {
        return this.dispatch('event.Withdrawn', withdrawel);
    }

}
