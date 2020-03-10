import firebase from 'firebase/app';
import 'firebase/database';
import CoinService from '@/services/CoinService';
import EventService from '@/services/EventService';
import {
    DepositEvent,
    WithdrawelEvent,
    RuleStateChangedEvent,
    RulePollCreatedEvent,
    RulePollFinishedEvent,
    MemberAddedEvent,
    MemberRemovedEvent,
    RewardPollCreatedEvent,
    RewardPollFinishedEvent,
    RewardPoolEvents,
} from '@/models/RewardPoolEvents';
import { IRewards, Reward } from './Reward';
import { IRewardRules, RewardRule, RewardRulePoll } from './RewardRule';
import BN from 'bn.js';
import NetworkService from '@/services/NetworkService';
import REWARD_JSON from '@/contracts/Reward.json';
import REWARD_RULE_POLL_JSON from '@/contracts/RulePoll.json';
import _ from 'lodash';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class RewardPool extends RewardPoolEvents {

    get claimableRewards() {
        const filtered = _.filter(this.allRewards, (r: Reward) => {
            return (r.state === 'Approved' || r.state === 'Pending');
        });
        return _.orderBy(filtered, 'startTime', 'desc');
    }

    get archivedRewards() {
        const filtered = _.filter(this.allRewards, (r: Reward) => {
            return (r.state === 'Withdrawn' || r.state === 'Rejected');
        });
        return _.orderBy(filtered, 'startTime', 'desc');
    }

    get rewards() {
        return _.orderBy(this.allRewards, 'startTime', 'desc');
    }

    set rewards(r: any) {
        this.allRewards[r.address] = r;
    }

    public name: string = '';
    public balance: BN = new BN(0);
    public events: any[] = [];
    public rewardRules: IRewardRules = {};
    // public members: any = {};
    // public managers: any = {};
    public isMember: boolean = false;
    public isManager: boolean = false;
    public address: string = '';
    public outOfSync: boolean = true;
    public transactions: any[] = [];

    private allRewards: IRewards = {};
    private account: string = '';
    private contract: any;
    private network: NetworkService;

    constructor(
        address: string,
        contract: any,
        network: NetworkService,
    ) {
        super();
        this.contract = contract;
        this.address = address;
        this.network = network;
        this.account = network.extdev.account;

        this.updateBalance();
        this.checkMemberships();
        this.getRewards();
        this.getRewardRules();
        this.getTransactions();
        this.getStream(); // Do this last since it uses other data

        this.contract.methods.name().call({ from: this.account })
            .then((name: string) => {
                this.name = name;
            });

        for (const event of this.eventTypes) {
            this.contract.events[event]()
                .on('data', (e: any) => {
                    (this as any)[`on${e.event}`](e.returnValues);
                });
        }
    }

    public async getRewardRules() {
        const length = await this.countRewardRules();

        for (let i = 0; i < length; i++) {
            const rewardRule = await this.getRewardRule(i);
            this.rewardRules[rewardRule.id] = rewardRule;
        }
    }

    public async getRewards() {
        const length = await this.countRewards();

        for (let i = 0; i < length; i++) {
            const reward = await this.getReward(i);
            this.allRewards[i] = reward;
        }
    }

    public async getTransactions() {
        const dLength = await this.countDeposits(this.account);
        const wLength = await this.countWithdrawels(this.account);

        for (let i = 0; i < dLength; i++) {
            const d = await this.depositOf(this.account, i);
            this.transactions.push(new Deposit(d));
        }

        for (let i = 0; i < wLength; i++) {
            const w = await this.withdrawelOf(this.account, i);
            this.transactions.push(new Withdrawel(w));
        }
    }

    public setOutOfSync(state: boolean) {
        this.outOfSync = state;
    }

    public async checkMemberships() {
        this.isMember = await this.hasMemberRole(this.account);
        this.isManager = await this.hasManagerRole(this.account);
    }

    public async hasMemberRole(account: string) {
        return await this.contract.methods.isMember(account).call({from: this.account });
    }

    public async hasManagerRole(account: string) {
        return await this.contract.methods.isManager(account).call({from: this.account });
    }

    public async onManagerAdded(data: any) {
        if (data.account === this.account) {
            this.isManager = await this.hasManagerRole(this.account);
        }
    }

    public async onManagerRemoved(data: any) {
        if (data.account === this.account) {
            this.isManager = await this.hasManagerRole(this.account);
        }
    }

    public async onMemberAdded(data: any) {
        if (data.account === this.account) {
            this.isMember = await this.hasMemberRole(this.account);
        }
    }

    public async onMemberRemoved(data: any) {
        if (data.account === this.account) {
            this.isMember = await this.hasMemberRole(this.account);
        }
    }

    public onDeposited(data: any) {
        this.updateBalance();
    }

    public onWithdrawn(data: any) {
        this.updateBalance();
    }

    public onRulePollCreated(data: any) {
        this.updateRule(data);
    }

    public onRulePollFinished(data: any) {
        this.updateRule(data);
    }

    public onRuleStateChanged(data: any) {
        this.updateRule(data);
    }

    public onRewardPollCreated(data: any) {
        this.updateReward(data);
    }

    public onRewardPollFinished(data: any) {
        this.updateReward(data);
    }

    public async addMember(address: string) {
        return await this.callPoolMethod(this.contract.methods.addMember(address));
    }

    public async removeMember(address: string) {
        return await this.callPoolMethod(this.contract.methods.removeMember(address));
    }

    public async createReward(ruleId: number) {
        return await this.contract.methods.createReward(ruleId)
            .send({
                from: this.account,
            });

    }

    public async addManager(address: string) {
        return await this.callPoolMethod(this.contract.methods.addManager(address));
    }

    public async removeManager(address: string) {
        return await this.callPoolMethod(this.contract.methods.removeManager(address));
    }

    public async addDeposit(tokenAmount: BN) {
        return await this.callPoolMethod(this.contract.methods.deposit(tokenAmount.toString()));
    }

    public async tryToFinalize(poll: RewardRulePoll) {
        return await this.callPoolMethod(poll.contract.methods.tryToFinalize());
    }

    public async tryToFinalizeRewardPoll(reward: Reward) {
        return await this.callPoolMethod(reward.contract.methods.tryToFinalize());
    }

    public async revokeVoteForRule(rule: RewardRule) {
        return await this.callPoolMethod(this.contract.methods.revokeVoteForRule(rule.id));
    }

    public async voteForRule(rule: RewardRule, agree: boolean) {
        return await this.callPoolMethod(this.contract.methods.voteForRule(rule.id, agree));
    }

    public async revokeVoteForReward(reward: Reward) {
        return await this.callPoolMethod(reward.contract.methods.revokeVote(reward.beneficiaryAddress));
    }

    public async voteForReward(reward: Reward, agree: boolean) {
        return await this.callPoolMethod(reward.contract.methods.vote(this.account, agree));
    }

    public async withdraw(reward: Reward) {
        return await this.callPoolMethod(reward.contract.methods.withdraw());
    }

    public async addRewardRulePoll(rule: any, proposedAmount: BN) {
        return await this.callPoolMethod(this.contract.methods.startRulePoll(rule.id, proposedAmount.toString()));
    }

    public async countRewards() {
        return await this.contract.methods.countRewards().call({
            from: this.account,
        });
    }

    public async countRewardRules() {
        return await this.contract.methods.countRules().call({
            from: this.account,
        });
    }

    // public async countRewardsOf(account: string) {
    //     return await this.contract.methods.countRewardsOf(account).call({
    //         from: this.account,
    //     });
    // }

    public async countDeposits(address: string) {
        return await this.contract.methods.countDeposits(address).call({
            from: this.account,
        });
    }

    public async countWithdrawels(address: string) {
        return await this.contract.methods.countDeposits(address).call({
            from: this.account,
        });
    }

    public async getRewardRule(id: number) {
        const data = await this.contract.methods.rules(id).call({ from: this.account });
        const snap = await firebase.database().ref(`pools/${this.address}/rules/${id}`).once('value');
        const meta = snap.val();

        return new RewardRule(data, meta);
    }

    public async getReward(id: number) {
        const address = await this.contract.methods.rewards(id).call({ from: this.account });
        const contract = await this.network.getExtdevContract(REWARD_JSON.abi, address);

        return new Reward(
            address,
            contract,
            this.account,
        );
    }

    // public async getRewardOf(index: number, account: string, pool: RewardPool) {
    //     const address = await this.contract.methods.rewardsOf(index, account).call({from: this.account});
    //     const contract = await this.getContract(REWARD_JSON.abi, address);
    //
    //     return new Reward(
    //         address,
    //         contract,
    //         this.account,
    //     );
    // }

    public async depositOf(address: string, index: number) {
        return await this.contract.methods.deposits(address, index)
            .call({
                from: this.account,
            });
    }

    public async withdrawelOf(address: string, index: number) {
        return await this.contract.methods.withdrawels(address, index)
            .call({
                from: this.account,
            });
    }

    public async getRewardRulePoll(rule: RewardRule) {
        const contract = await this.getContract(REWARD_RULE_POLL_JSON.abi, rule.pollAddress);
        const poll = new RewardRulePoll(
            rule.pollAddress,
            contract,
            this.account,
        );

        await poll.update();

        return poll;
    }

    public async addRewardRule(rule: any) {
        const tx = await this.callPoolMethod(this.contract.methods.createRule());
        const id = tx.events.RuleStateChanged.returnValues.id;
        const state = tx.events.RuleStateChanged.returnValues.state;

        return await firebase.database().ref(`pools/${this.address}/rules/${id}`)
            .set({
                title: rule.title,
                description: rule.description,
                state,
            });
    }

    public async getRewardPoolEventDataFromHash(hash: string, type: string) {
        try {
            const tx = await this.network.extdev.web3js.eth.getTransaction(hash);
            const receipt = await this.network.extdev.web3js.eth.getTransactionReceipt(hash);
            const eventInterface = _.find(
                this.contract._jsonInterface,
                (o: any) => o.name === type && o.type === 'event',
            );
            const log = _.find(
                receipt.logs,
                (l: any) => l.topics.includes(eventInterface.signature),
            );
            if (log) {
                const event = await this.network.extdev.web3js.eth.abi.decodeLog(
                    eventInterface.inputs,
                    log.data,
                    log.topics.slice(1),
                );

                return { type, event, blockTime: log.blockTime, from: tx.from };
            }
        } catch (err) {
            return err;
        }
    }

    private async updateBalance() {
        this.balance = await new CoinService().getExtdevBalance(this.address);
    }

    private async updateReward(data: any) {
        const id = parseInt(data.reward, 10);
        const reward = await this.getReward(id);

        this.allRewards[id] = reward;
    }

    private async updateRule(data: any) {
        const id = parseInt(data.id, 10);

        this.rewardRules[id] = await this.getRewardRule(id);
    }

    private getStream() {
        firebase.database().ref(`pools/${this.address}/events`)
            .limitToLast(15)
            .on('child_added', async (snap: any) => {
                const data = snap.val();

                if (data.hash) {
                    for (const type of this.eventTypes) {
                        const logs = await this.getRewardPoolEventDataFromHash(data.hash, type);

                        if (logs) {
                            const model = this.getEventModel(type, logs, data.hash);

                            this.events.push(model);
                        }
                    }
                } else {
                    await firebase.database().ref(`pools/${this.address}/events/${snap.key}`).remove();
                }
            });
    }

    private getEventModel(type: string, data: any, hash: string) {
        let eventModel: any = {};

        if (type === 'MemberAdded') {
            eventModel = new MemberAddedEvent(data, data.blockTime);
        }
        if (type === 'MemberRemoved') {
            eventModel = new MemberRemovedEvent(data, data.blockTime);
        }
        if (type === 'Deposited') {
            eventModel = new DepositEvent(data, data.blockTime);
        }
        if (type === 'Withdrawn') {
            eventModel = new WithdrawelEvent(data, data.blockTime);
        }
        if (type === 'RuleStateChanged') {
            eventModel = new RuleStateChangedEvent(data, data.blockTime);
        }
        if (type === 'RulePollCreated') {
            eventModel = new RulePollCreatedEvent(data, data.blockTime);
        }
        if (type === 'RulePollFinished') {
            eventModel = new RulePollFinishedEvent(data, data.blockTime);
        }
        if (type === 'RewardPollCreated') {
            eventModel = new RewardPollCreatedEvent(data, data.blockTime);
        }
        if (type === 'RewardPollFinished') {
            eventModel = new RewardPollFinishedEvent(data, data.blockTime);
        }
        eventModel.hash = hash;

        return eventModel;
    }

    private async getContract(abi: any, address: string) {
        return await this.network.getExtdevContract(
            abi,
            address,
        );
    }

    private async callPoolMethod(method: any) {
        const snap = await firebase.database().ref(`pools/${this.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${this.address}/events/${snap.key}`)
                .set({
                    state: 0,
                });

            const tx = await method.send({ from: this.account });

            await firebase.database().ref(`pools/${this.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    state: 1,
                });

            return tx;
        } catch (err) {
            await firebase.database().ref(`pools/${this.address}/events/${snap.key}`)
                .remove();
            return err;
        }
    }
}

export interface IRewardPools {
    [address: string]: RewardPool;
}

export interface IRewardPool {
    address: string;
    name: string;
    balance: number;
    outOfSync: boolean;
    contract: any;
    owner: string;
    eventService: EventService;
    _events: string[];
}

class Transaction {
    public amount: string;
    public created: number;

    constructor(data: any) {
        this.amount = new BN(data.amount).div(TOKEN_MULTIPLIER).toString();
        this.created = parseInt(data.created, 10);
    }
}

export class Deposit extends Transaction {
    public sender: string;

    constructor(data: any) {
        super(data);
        this.sender = data.sender;
    }
}

export class Withdrawel extends Transaction {
    public receiver: string;

    constructor(data: any) {
        super(data);
        this.receiver = data.receiver;
    }
}
