import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import {
    RewardPool,
    DepositEvent,
    WithdrawelEvent,
    RuleStateChangedEvent,
    RulePollCreatedEvent,
    RulePollFinishedEvent,
} from '@/models/RewardPool';
import { RewardRule, RewardRulePoll } from '@/models/RewardRule';
import store from '../store';
import REWARD_POOL_JSON from '@/contracts/RewardPool.json';
import REWARD_RULE_POLL_JSON from '@/contracts/RulePoll.json';
import BN from 'bn.js';
import _ from 'lodash';

export default class PoolService extends Vue {
    public $store: any = store;
    private $account!: Account;
    private $network!: Network;

    public subscribeRewardPools() {
        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                const pool = await this.getRewardPool(s.key);

                this.$store.commit('addRewardPool', pool);
            });

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_removed', async (s: any) => {
                const pool = await this.getRewardPool(s.key);

                this.$store.commit('removeRewardPool', pool);
            });
    }

    public async getRewardPoolContract(address: string) {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            REWARD_POOL_JSON.abi,
            address,
        );
    }

    public async getRewardRulePollContract(address: string) {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            REWARD_RULE_POLL_JSON.abi,
            address,
        );
    }

    public async getRewardPool(address: string) {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = REWARD_POOL_JSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        const pool = new RewardPool(
            address,
            await this.getRewardPoolContract(address),
            this.$network.extdev.account,
        );

        pool.setOutOfSync(address !== receipt.contractAddress);

        return pool;
    }

    public async getRewardRule(id: number, pool: RewardPool) {
        const data = await pool.contract.methods.rules(id).call({from: this.$network.extdev.account});
        const snap = await firebase.database().ref(`pools/${pool.address}/rules/${id}`).once('value');
        const meta = snap.val();

        return new RewardRule(data, meta);
    }

    public async getMyRewardPools() {
        const snap: any = await firebase.database().ref(`users/${this.$account.uid}/pools`).once('value');
        const pools: any = {};

        for (const address in snap.val()) {
            if (snap.val()[address]) {
                const pool = await this.getRewardPool(address);
                pools[address] = pool;
            }
        }

        return pools;
    }

    public joinRewardPool(address: string) {
        return firebase.database().ref(`users/${this.$account.uid}/pools`).child(address)
            .set({
                address,
            });
    }

    public async getRewardPoolEvents(pool: RewardPool) {
        const snap: any = await firebase.database().ref(`pools/${pool.address}/events`).once('value');
        const data = snap.val();
        const events: any = [];

        for (const key in data) {
            if (data[key].hash) {
                for (const type of pool.eventTypes) {
                    const logs = await this.getRewardPoolEventDataFromHash(data[key].hash, type);
                    if (logs) {
                        const model = this.getEventModel(type, logs, data[key].hash);
                        events.push(model);
                    }
                }
            } else {
                await firebase.database().ref(`pools/${pool.address}/events/${key}`).remove();
            }
        }

        return events;
    }

    public async getRewardRules(pool: RewardPool) {
        const length = await pool.contract.methods.countRules().call({ from: this.$network.extdev.account });
        const rules: RewardRule[] = [];

        for (let i = 0; i < length; i++) {
            const rule = await this.getRewardRule(i, pool);

            rules.push(rule);
        }
        return rules;
    }

    public async getRewardRulePoll(rule: RewardRule) {
        const contract = await this.getRewardRulePollContract(rule.pollAddress);
        const poll = new RewardRulePoll(
            rule.pollAddress,
            contract,
            this.$network.extdev.account,
        );

        await poll.update();

        return poll;
    }

    public async addMember(address: string, pool: RewardPool) {
        return;
    }

    public async addManager(address: string, pool: RewardPool) {
        return;
    }

    public async addDeposit(tokenAmount: BN, pool: RewardPool) {
        const snap = await firebase.database().ref(`pools/${pool.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    state: 0,
                });

            const tx = await pool.contract.methods.deposit(tokenAmount.toString())
                .send({ from: this.$network.extdev.account });

            return await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    state: 1,
                });
        } catch (err) {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .remove();
            return err;
        }
    }

    public async addRewardRule(rule: any, pool: RewardPool) {
        const snap = await firebase.database().ref(`pools/${pool.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    success: 0,
                });

            const tx = await pool.contract.methods.createRule(rule.slug.toString())
                .send({ from: this.$network.extdev.account });
            const id = tx.events.RuleStateChanged.returnValues.id;
            const state = tx.events.RuleStateChanged.returnValues.state;

            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    success: 1,
                });

            return await firebase.database().ref(`pools/${pool.address}/rules/${id}`)
                .set({
                    title: rule.title,
                    description: rule.description,
                    state,
                });

        } catch (err) {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .remove();
            return err;
        }
    }

    public async tryToFinalize(poll: RewardRulePoll, pool: RewardPool) {
        const snap = await firebase.database().ref(`pools/${pool.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    success: 0,
                });

            const tx = await poll.contract.methods.tryToFinalize()
                .send({ from: this.$network.extdev.account });

            return await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    success: 1,
                });

        } catch (err) {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .remove();

            return err;
        }
    }

    public async voteForRule(rule: RewardRule, pool: RewardPool, agree: boolean) {
        const snap = await firebase.database().ref(`pools/${pool.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    success: 0,
                });

            const tx = await pool.contract.methods.voteForRule(
                    rule.id,
                    agree,
                )
                .send({ from: this.$network.extdev.account });

            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    success: 1,
                });

            return await this.getRewardRule(rule.id, pool);

        } catch (err) {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .remove();

            return err;
        }
    }

    public async addRewardRulePoll(rule: any, pool: RewardPool, proposedAmount: BN) {
        const snap = await firebase.database().ref(`pools/${pool.address}/events`)
            .push();

        try {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    success: 0,
                });

            const tx = await pool.contract.methods.startRulePoll(
                    rule.id,
                    proposedAmount.toString(),
                )
                .send({ from: this.$network.extdev.account });

            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    success: 1,
                });

            return tx;

        } catch (err) {
            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .remove();

            return err;
        }
    }

    private getEventModel(type: string, data: any, hash: string) {
        if (type === 'Deposited') {
            const deposit = new DepositEvent(data.logs, data.blockTime);
            deposit.hash = hash;

            return deposit;
        }
        if (type === 'Withdrawn') {
            const withdrawel = new WithdrawelEvent(data.logs, data.blockTime);
            withdrawel.hash = hash;

            return withdrawel;
        }
        if (type === 'RuleStateChanged') {
            const ruleStateChanged = new RuleStateChangedEvent(data.logs, data.blockTime);
            ruleStateChanged.hash = hash;

            return ruleStateChanged;
        }
        if (type === 'RulePollCreated') {
            const rulePollCreated = new RulePollCreatedEvent(data.logs, data.blockTime);
            rulePollCreated.hash = hash;

            return rulePollCreated;
        }
        if (type === 'RulePollFinished') {
            const rulePollFinished = new RulePollFinishedEvent(data.logs, data.blockTime);
            rulePollFinished.hash = hash;

            return rulePollFinished;
        }
    }

    private async getRewardPoolEventDataFromHash(hash: string, type: string) {
        try {
            const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
            const contract = await this.getRewardPoolContract(receipt.contractAddress);
            const eventInterface = _.find(
                contract._jsonInterface,
                (o: any) => o.name === type && o.type === 'event',
            );
            const log = _.find(
                receipt.logs,
                (l: any) => l.topics.includes(eventInterface.signature),
            );
            if (log) {
                const logs = await this.$network.extdev.web3js.eth.abi.decodeLog(
                    eventInterface.inputs,
                    log.data,
                    log.topics.slice(1),
                );
                return { type, logs, blockTime: log.blockTime };
            }
        } catch (err) {
            return err;
        }
    }
}
