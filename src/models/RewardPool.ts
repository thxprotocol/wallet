import firebase from 'firebase/app';
import 'firebase/database';
import NetworkService from '@/services/NetworkService';
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
    ManagerAddedEvent,
    ManagerRemovedEvent,
} from '@/models/RewardPoolEvents';
import { Reward } from '@/models/Reward';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import _ from 'lodash';
import BN from 'bn.js';
import REWARD_JSON from '@/contracts/Reward.json';
import REWARD_RULE_POLL_JSON from '@/contracts/RulePoll.json';
import UserService from '@/services/UserService';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export class RewardPool extends RewardPoolEvents {
    public name: string = '';
    public balance: BN = new BN(0);
    public members: any = {};
    public isMember: boolean = false;
    public isManager: boolean = false;
    public address: string = '';
    public outOfSync: boolean = true;
    public transactions: any[] = [];

    public events: any[] = [];
    public rewards: Reward[] = [];
    public rewardRules: RewardRule[] = [];

    private account: string = '';
    private contract: any;
    private network: NetworkService;
    private userService: UserService = new UserService();

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
        this.getRewardRules();
        this.getRewards();
        this.getTransactions();
        this.getMembers();
        this.getStream(); // Do this last since it uses other data

        this.contract.methods.name().call({ from: this.account })
            .then((name: string) => {
                this.name = name;
            });

        for (const event of this.eventTypes) {
            this.contract.events[event]()
                .on('data', (e: any) => {
                    const method = `on${e.event}`;
                    if ((this as any)[method]) {
                        (this as any)[method](e.returnValues);
                    }
                });
        }
    }

    public async getMembers() {
        let i = 0;
        while (i < 10) {
            try {
                const address = await this.contract.methods.members(i).call({ from: this.account });
                const member = await this.userService.getMemberByAddress(address);

                member.isMember = await this.contract.methods.isMember(address).call({ from: this.account });
                member.isManager = await this.contract.methods.isManager(address).call({ from: this.account });

                if (member.isMember) {
                    this.members[address] = member;
                }

                i++;
            } catch (e) {
                break; // We are letting this.contract.methods.members(i) fail delibirately.
            }
        }
    }

    public async getRewardRules() {
        const length = parseInt(await this.countRewardRules(), 10);

        if (length > 0) {
            for (let id = length - 1; id >= 0; id--) {
                const rewardRule = await this.getRewardRule(id);

                if (this.rewardRules.indexOf(rewardRule) === -1) {
                    this.rewardRules.push(rewardRule);
                }
            }
        }
    }

    public async getRewards() {
        const length = parseInt(await this.countRewards(), 10);

        if (length > 0) {
            for (let id = length - 1; id >= 0 ; id--) {
                const reward = await this.getReward(id);

                if (this.rewards.indexOf(reward) === -1) {
                    this.rewards.push(reward);
                }
            }
        }
    }

    public async getTransactions() {
        const dLength = await this.countDeposits(this.account);
        const wLength = await this.countWithdrawels(this.account);

        for (let i = 0; i < dLength; i++) {
            const d = await this.depositOf(this.account, i);
            this.transactions.push(new Deposit(d, this));
        }

        for (let i = 0; i < wLength; i++) {
            const w = await this.withdrawelOf(this.account, i);
            this.transactions.push(new Withdrawel(w, this));
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
        this.getMembers();
        this.checkMemberships();
    }

    public async onManagerRemoved(data: any) {
        this.getMembers();
        this.checkMemberships();
    }

    public async onMemberAdded(data: any) {
        this.getMembers();
        this.checkMemberships();
    }

    public async onMemberRemoved(data: any) {
        this.getMembers();
        this.checkMemberships();
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
        this.addReward(data);
    }

    public onRewardPollFinished(data: any) {
        this.updateReward(data);
    }

    public async addMember(address: string) {
        return await this.callPoolMethod(this.contract.methods.addMember(address));
    }

    public async removeMember(address: string) {
        return await this.callPoolMethod(this.contract.methods.renounceMember());
    }

    public async createReward(ruleId: number) {
        return await this.contract.methods.createReward(ruleId).send({ from: this.account });
    }

    public async addManager(address: string) {
        return await this.callPoolMethod(this.contract.methods.addManager(address));
    }

    public async removeManager(address: string) {
        return await this.callPoolMethod(this.contract.methods.renounceManager());
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

    public async countRewardsOf(account: string) {
        return await this.contract.methods.countRewardsOf(account).call({
            from: this.account,
        });
    }

    public async countDeposits(address: string) {
        return await this.contract.methods.countDeposits(address).call({
            from: this.account,
        });
    }

    public async countWithdrawels(address: string) {
        return await this.contract.methods.countWithdrawels(address).call({
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
            id,
            address,
            contract,
            this.account,
        );
    }

    public async getRewardOf(account: string, index: number) {
        const address = await this.contract.methods.rewardsOf(index, account).call({from: this.account});
        const contract = await this.network.getExtdevContract(REWARD_JSON.abi, address);

        return new Reward(
            index,
            address,
            contract,
            this.account,
        );
    }

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

    private async addReward(data: any) {
        const id = parseInt(data.id, 10);
        const reward = await this.getReward(id);

        if (this.rewards.indexOf(reward) === -1) {
            this.rewards.push(reward);
        }
    }

    private async updateReward(data: any) {
        const id = parseInt(data.id, 10);

        if (this.rewards[id]) {
            await this.rewards[id].update();
        }
    }

    private async updateRule(data: any) {
        const id = parseInt(data.id, 10);
        const rule = this.rewardRules.find((r: RewardRule) => {
            return id === r.id;
        });
        if (rule) {
            const index = this.rewardRules.indexOf(rule);

            this.rewardRules[index] = rule;
        } else {
            const r = await this.getRewardRule(id);

            this.rewardRules.push(r);
        }
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
        if (type === 'ManagerAdded') {
            eventModel = new ManagerAddedEvent(data, data.blockTime);
        }
        if (type === 'ManagerRemoved') {
            eventModel = new ManagerRemovedEvent(data, data.blockTime);
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
    public pool: RewardPool;

    constructor(data: any, pool: RewardPool) {
        super(data);
        this.sender = data.sender;
        this.pool = pool;
    }
}

export class Withdrawel extends Transaction {
    public receiver: string;
    public pool: RewardPool;

    constructor(data: any, pool: RewardPool) {
        super(data);
        this.receiver = data.receiver;
        this.pool = pool;
    }
}
