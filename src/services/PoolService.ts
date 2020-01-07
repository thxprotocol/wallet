import firebase from 'firebase/app';
import 'firebase/database';
import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import { RewardPool, IRewardPools, Transaction, Deposit, Withdrawel } from '@/models/RewardPool';
import store from '../store';
import BN from 'bn.js';

const _ = require('lodash');
const InputDataDecoder = require('ethereum-input-data-decoder');
const RewardPoolJSON = require('@/contracts/RewardPool.json');

export default class PoolService extends Vue {
    public $store: any = store;
    private $account!: Account;
    private $network!: Network;

    public subscribeRewardPools() {
        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('addRewardPool', pool);
                    });
            });

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_removed', (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('removeRewardPool', pool);
                    });
            });
    }

    public subscribeRewardPoolEvents() {
        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_added', async (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('addRewardPool', pool);
                    });
            });

        firebase.database().ref(`users/${this.$account.uid}/pools`)
            .on('child_removed', (s: any) => {
                this.getRewardPool(s.key)
                    .then((pool: RewardPool) => {
                        this.$store.commit('removeRewardPool', pool);
                    });
            });
    }

    public async getRewardPoolContract(address: string) {
        return await this.$network.getExtdevContract(
            this.$network.extdev.web3js,
            RewardPoolJSON.abi,
            address,
        );
    }

    public async getRewardPool(address: string) {
        const nid = await this.$network.extdev.web3js.eth.net.getId();
        const hash = RewardPoolJSON.networks[nid].transactionHash;
        const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
        const pool = new RewardPool(
            address,
            await this.getRewardPoolContract(address),
            this.$network.extdev.account,
        );

        pool.setOutOfSync(address !== receipt.contractAddress);

        return pool;
    }

    public async getMyRewardPools() {
        const snap: any = await firebase.database().ref(`users/${this.$account.uid}/pools`).once('value');
        let pools: any = {};

        for (const address in snap.val()) {
            const pool = await this.getRewardPool(address);
            pools[address] = pool;
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
        let events: any = [];

        for (const key in data) {
            if (data[key].hash) {
                for (const type of pool.eventTypes) {
                    let d = await this.getRewardPoolEventLogsFromHash(data[key].hash, type);
                    if (d) {
                        const model = this.getEventModel(type, d, data[key].hash);
                        events.push(model);
                    }
                }
            } else {
                await firebase.database().ref(`pools/${pool.address}/events`).remove();
            }
        }

        return events;
    }

    private getEventModel(type: string, data: any, hash: string) {
        if (type === 'Deposited') {
            const deposit = new Deposit(data.logs);
            deposit.hash = hash;

            return deposit;
        }
        if (type === 'Withdrawn') {
            const withdrawel = new Withdrawel(data.logs);
            withdrawel.hash = hash;

            return withdrawel;
        }
    }

    private async getRewardPoolEventLogsFromHash(hash: string, type: string) {
        try {
            const receipt = await this.$network.extdev.web3js.eth.getTransactionReceipt(hash);
            const contract = await this.getRewardPoolContract(receipt.contractAddress);
            const eventInterface = _.find(
                contract._jsonInterface,
                (o: any) => o.name === type && o.type === 'event',
            );
            const log = _.find(
                receipt.logs,
                (l: any) => l.topics.includes(eventInterface.signature)
            );
            if (log) {
                const logs = await this.$network.extdev.web3js.eth.abi.decodeLog(
                    eventInterface.inputs,
                    log.data,
                    log.topics.slice(1),
                );

                return { type, logs };
            }
        } catch (err) {
            return err;
        }
    }

    public async addMember(address: string, pool: RewardPool) {
        return;
    }

    public async addManager(address: string, pool: RewardPool) {
        return;
    }

    public async addDeposit(tokenAmount: BN, pool: RewardPool) {
        try {
            // Add the deposit event to firebase events array
            // and return the firebase key in that array
            const snap = await firebase.database().ref(`pools/${pool.address}/events`)
                .push();

            await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .set({
                    state: 0,
                });

            // If succesful add it to loom network
            const tx = await pool.contract.methods.deposit(tokenAmount.toString())
                .send({ from: this.$network.extdev.account })

            // Add tx hash to event in fb
            return await firebase.database().ref(`pools/${pool.address}/events/${snap.key}`)
                .update({
                    hash: tx.transactionHash,
                    state: 1,
                });
        } catch (err) {
            // If not succesful remove from firebase
            return err;
        }
    }
}
