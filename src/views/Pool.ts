import { Component, Prop, Vue } from 'vue-property-decorator';
import EventService from '../services/EventService';
import Rules from '../components/Rules.vue';
import Rewards from '../components/Rewards.vue';
import Modal from '../components/Modal.vue';
import { BSpinner, BTab, BTabs, BListGroup, BListGroupItem } from 'bootstrap-vue';

const RewardPool = require('../contracts/RewardPool.json');
const _ = require('lodash');
const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));
const THX = window.THX;

const RuleState = ['Active', 'Disabled'];
// const RewardState = ['Pending', 'Approved', 'Rejected', 'Withdrawn'];

@Component({
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
})
export default class Pool extends Vue {

    get orderedStream() {
        return _.orderBy(this.stream, 'timestamp').reverse()
    }

    public contract: any = null;
    public loading: boolean = false;
    public events: any = new EventService();
    public stream: any[] = [];

    public account: any = {
        loom: {
            address: ''
        },
        isManager: false,
        isMember: false,
    };
    public pool:any = {
        address: '',
        name: '',
        balance: 0,
    };
    public input:any = {
        poolDeposit: 0,
        addMember: '',
        addManager: '',
    };
    public modal:any = {
        addMember: false,
        addManager: false,
        poolDeposit: false,
    };

    constructor() {
        super();
        
        if (THX.network.hasKeys) {
            this.init();
        }
    }

    async init() {
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
                .then((events: any[]) => {
                    if (events.length > 0) {
                        for (let event of events) {
                            this[`on${event.event}`](event.returnValues, event.blockTime);
                        }
                    }
                })
                .catch((err: string) => {
                    // eslint-disable-next-line
                    console.error(err);
                });
        }
    }

    onRulePollCreated(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp, 10),
            title: `Rule #${data.id} poll: ${new BN(data.proposedAmount).div(tokenMultiplier)} THX`,
        });
    }

    onRulePollFinished(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `Rule #${data.id} poll ${data.approved ? 'approved' : 'rejected'}`,
            variant: data.approved ? 'success' : 'danger'
        });
    }

    onRuleStateChanged(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `Rule #${data.id} set to ${RuleState[data.state]}`,
        });
    }

    onDeposited(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `+${new BN(data.amount).div(tokenMultiplier)} THX (Deposit)`,
            body: `${data.sender}`,
            variant: 'success',
        });
    }

    onWithdrawn(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `-${new BN(data.amount).div(tokenMultiplier)} THX (Withdrawel)`,
            body: `${data.sender}`,
            variant: 'danger',
        });
    }

    onManagerAdded(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `New manager promotion`,
            body: `${data.account}`
        });
    }

    onMemberAdded(data: any, timestamp: string) {
        this.stream.push({
            timestamp: parseInt(timestamp),
            title: `New member added`,
            body: `${data.account}`,
        });
    }

    // onRewardPollCreated(data: any, timestamp: string) {
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
    }

    onAddMember() {
        this.loading = true;

        return this.contract.methods.addMember(this.input.addMember).send({ from: this.account.loom.address })
            .then(async () => {
                this.loading = false;
            })
            .catch(async (err: string) => {
                // eslint-disable-next-line
                console.error(err);
            });
    }

    onTransferToPool() {
        const tokenAmount = new BN(this.input.poolDeposit).mul(tokenMultiplier);

        this.loading = true;

        return this.contract.methods.deposit(tokenAmount.toString())
            .send({ from: this.account.loom.address })
            .then(async () => {
                const token = THX.network.instances.token;

                this.pool.balance = new BN(await token.methods.balanceOf(this.pool.address).call()).div(tokenMultiplier);
                this.input.poolDeposit = 0;
                this.loading = false;

                this.$parent.$refs.header.updateBalance();
            });
    }
}