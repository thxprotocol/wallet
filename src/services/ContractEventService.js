import EventService from './EventService';
import RewardJSON from '../contracts/Reward.json';

export default class ContractEventService {
    constructor(instances, currentUserAddress) {
        const pool = instances.pool;
        const token = instances.token;
        const tokenRinkeby = instances.tokenRinkeby;

        let amountOfRewards;

        this.ea = new EventService();

        pool.methods.countRewards().call().then(async (amount) => {
            const web3 = THX.contracts.loomWeb3;

            console.info(`Subscribing for StateChange Events on ${amount} contracts.`);

            // Get all rewards for the pool that need listening
            for (var i = 0; i < amount; i++) {
                const rewardAddress = await pool.methods.rewards(i).call();
                const reward = new web3.eth.Contract(RewardJSON.abi, rewardAddress, { from: currentUserAddress });

                reward.events.RewardStateChanged({}, (error, event) => this.onRewardStateChanged(event.returnValues));
                reward.events.RewardStateChanged({filter: { beneficiary: currentUserAddress }}, (error, event) => this.onMyRewardStateChanged(event.returnValues));
            }
        });

        pool.events.RuleStateChanged({}, (error, event) => this.onRuleStateChanged(event.returnValues));
        pool.events.Deposited({}, (error, event) => this.onDeposited(event.returnValues));
        pool.events.Withdrawn({}, (error, event) => this.onWithdrawn(event.returnValues));

        token.events.Transfer({ to: currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));
        token.events.Transfer({ from: currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));

        tokenRinkeby.events.Transfer({ to: currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));
        tokenRinkeby.events.Transfer({ from: currentUserAddress }, (error, event) => this.onTransfer(event.returnValues));
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
