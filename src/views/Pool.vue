<template>
    <article class="region region--container">
        <main class="region region--content">
            <div class="region region--jumbotron">
                <strong class="font-size-xl">{{this.pool.balance}} THX</strong>
                <p>{{ pool.name }}</p>
            </div>

            <div class="row">
                <div class="col-12">
                    <BTabs content-class="mt-4" justified>

                        <BTab title="Stream" active>

                            <div class="text-center" v-if="!orderedStream.length">
                                <BSpinner label="Loading..."></BSpinner>
                            </div>

                            <BListGroup v-if="orderedStream">
                                <BListGroupItem v-bind:key="transfer.key" v-for="transfer in orderedStream" variant="transfer.variant">
                                    <div class="d-flex w-100 justify-content-between">
                                        <strong v-bind:class="`text-${transfer.variant}`">{{transfer.title}}</strong>
                                        <small>{{ transfer.timestamp | moment("MMMM Do YYYY HH:mm") }}</small>
                                    </div>
                                    <small class="mb-1">{{transfer.body}}</small>
                                </BListGroupItem>
                            </BListGroup>

                        </BTab>

                        <BTab title="Rules">

                            <Rules v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rules>

                        </BTab>

                        <BTab title="Rewards">

                            <Rewards v-if="contract && account" v-bind:contract="contract" v-bind:account="account"></Rewards>

                        </BTab>

                        <BTab title="Actions">

                            <ul class="list-bullets">
                                <li v-if="account.isManager"><button class="btn btn-link" @click="modal.addManager = true">Add Manager</button></li>
                                <li v-if="account.isMember"><button class="btn btn-link" @click="modal.addMember = true">Invite Member</button></li>
                                <li><button class="btn btn-link" @click="modal.poolDeposit = true">Pool Deposit</button></li>
                            </ul>

                        </BTab>
                    </BTabs>
                </div>
            </div>

            <Modal v-if="modal.addMember" @close="modal.addMember = false">
                <h3 slot="header">Invite new member to the pool:</h3>
                <div slot="body">
                    <input v-if="!loading" v-model="input.addMember" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <span v-if="loading" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onAddMember()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add member</button>
                </template>
            </Modal>

            <Modal v-if="modal.addManager" @close="modal.addManager = false">
                <h3 slot="header">Add a manager for this pool:</h3>
                <div slot="body">
                    <input v-if="!loading" v-model="input.addMember" type="text" class="form-control" placeholder="0x0000000000000000000000000000000000000000">
                    <span v-if="loading" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onAddManager()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Add manager</button>
                </template>
            </Modal>

            <Modal v-if="modal.poolDeposit" @close="modal.poolDeposit = false">
                <h3 slot="header">Reward pool deposit:</h3>
                <div slot="body">
                    <p>Reward Pool balance: <strong>{{this.pool.balance}} THX</strong></p>
                    <input v-if="!loading" v-model="input.poolDeposit" type="number" class="form-control" />
                    <span v-if="loading" class="">Processing transaction...</span>
                </div>
                <template slot="footer">
                    <button @click="onTransferToPool()" v-bind:class="{ disabled: loading }" class="btn btn-primary">Deposit {{ input.poolDeposit }} THX</button>
                </template>
            </Modal>

        </main>
    </article>
</template>

<script>
import EventService from '../services/EventService';
import RewardPool from '../contracts/RewardPool.json';
import Rules from '../components/Rules';
import Rewards from '../components/Rewards';
import Modal from '../components/Modal';
import { BSpinner, BTab, BTabs, BListGroup, BListGroupItem } from 'bootstrap-vue';

const _ = require('lodash');
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

const RuleState = ['Active', 'Disabled'];
// const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

export default {
    name: 'pool',
    components: {
        Modal,
        Rules,
        Rewards,
        BSpinner,
        BTabs,
        BTab,
        BListGroup,
        BListGroupItem,
    },
    computed: {
        orderedStream: function () {
            return _.orderBy(this.stream, 'timestamp').reverse()
        }
    },
    data: function() {
        return {
            contract: null,
            loading: false,
            events: new EventService(),
            stream: [],
            account: {
                loom: {
                    address: ''
                },
                isManager: false,
                isMember: false,
            },
            pool: {
                address: '',
                name: '',
                balance: 0,
            },
            input: {
                poolDeposit: 0,
                addMember: '',
                addManager: '',
            },
            modal: {
                addMember: false,
                addManager: false,
                poolDeposit: false,
            },
        }
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            const THX = window.THX;
            const token = THX.network.instances.token;

            this.pool.address = this.$route.params.id;
            this.contract = await THX.network.contract(RewardPool, this.pool.address);

            this.account.loom = THX.network.account;
            this.account.rinkeby = THX.network.rinkeby.account;
            this.account.isManager = await this.contract.methods.isManager(this.account.loom.address).call();
            this.account.isMember = await this.contract.methods.isMember(this.account.loom.address).call();

            this.pool.name = await this.contract.methods.name().call();
            this.pool.balance = new BN( await token.methods.balanceOf(this.pool.address).call() ).div(tokenMultiplier);

            this.$parent.$refs.header.updateBalance();

            this.events.subscribePoolEvents(this.contract.events);

            const hash = RewardPool.networks[9545242630824].transactionHash;
            const receipt = await THX.network.loom.eth.getTransactionReceipt(hash);

            for (let e of this.events.poolEvents) {
                this.contract.getPastEvents(e, { fromBlock: receipt.blockNumber, toBlock: 'latest'})
                    .then(events => {
                        if (events.length > 0) {
                            for (let event of events) {
                                this[`on${event.event}`](event.returnValues, event.blockTime);
                            }
                        }
                    })
                    .catch(err => {
                        // eslint-disable-next-line
                        console.error(err);
                    });
            }
        },
        onRulePollCreated(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `Rule #${data.id} size poll: ${new BN(data.proposedAmount).div(tokenMultiplier)} THX`,
            });
        },
        onRulePollFinished(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `Rule #${data.id} poll ${data.approved ? 'approved' : 'rejected'}`,
                variant: data.approved ? 'success' : 'danger'
            });
        },
        onRuleStateChanged(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `Rule #${data.id} set to ${RuleState[data.state]}`,
            });
        },
        onDeposited(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `+${new BN(data.amount).div(tokenMultiplier)} THX (Deposit)`,
                body: `${data.sender}`,
                variant: 'success',
            });
        },
        onWithdrawn(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `-${new BN(data.amount).div(tokenMultiplier)} THX (Withdrawel)`,
                body: `${data.sender}`,
                variant: 'danger',
            });
        },
        onManagerAdded(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `New manager promotion`,
                body: `${data.account}`
            });
        },
        onMemberAdded(data, timestamp) {
            this.stream.push({
                timestamp: parseInt(timestamp),
                title: `New member added`,
                body: `${data.account}`,
            });
        },
        // onRewardPollCreated(data, timestamp) {
        //     this.stream.push({
        //         timestamp: parseInt(timestamp),
        //         title: `Reward poll started`,
        //     });
        // },
        // onRewardPollFinished(data, timestamp) {
        //     this.stream.push({
        //         timestamp: parseInt(timestamp),
        //         title: `Reward poll finished`,
        //     });
        // },
        onAddManager() {
            this.loading = true;

            return this.contract.methods.addManager(this.input.addManager)
                .send({ from: this.account.loom.address })
                .then(async () => {
                    this.loading = false;
                });
        },
        onAddMember() {
            this.loading = true;

            return this.contract.methods.addMember(this.input.addMember).send({ from: this.account.loom.address })
                .then(async () => {
                    this.loading = false;
                })
                .catch(async (err) => {
                    // eslint-disable-next-line
                    console.error(err);
                });
        },
        onTransferToPool() {
            const tokenAmount = new BN(this.input.poolDeposit).mul(tokenMultiplier);

            this.loading = true;

            return this.contract.methods.deposit(tokenAmount.toString())
                .send({ from: this.account.loom.address })
                .then(async () => {
                    const THX = window.THX;
                    const token = THX.network.instances.token;

                    this.pool.balance = new BN(await token.methods.balanceOf(this.pool.address).call()).div(tokenMultiplier);
                    this.input.poolDeposit = 0;
                    this.loading = false;

                    this.$parent.$refs.header.updateBalance();
                });
        }
    }
}
</script>
