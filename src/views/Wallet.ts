import Vue from 'vue';
import EventService from '../services/EventService';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';

const THX = window.THX;

@Component({
    name: 'home',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    }
})
export default class Wallet extends Vue {
    public events: any = null;
    public tokenTransfers: any[] = [];

    get orderedTokenTransfers() {
        let arr: any[] = [];
        for (let hash in this.tokenTransfers) {
            arr.unshift(this.tokenTransfers[hash]);
        }

        return arr.reverse()
    }

    constructor() {
        super();

        if (THX.network.hasKeys) {
            this.events = new EventService();
            this.init();
        }
    }

    async init() {
        const token = await THX.network.instances.token;
        const fromBlock = await this.getCurrentBlockId();
        const offset = 10000;
        const address = THX.network.account.address;

        this.$parent.$refs.header.updateBalance();

        this.events.listen('event.Transfer', this.addMyTransfer);
        // this.events.listen('event.Deposited', this.addDeposit);
        // this.events.listen('event.Withdrawn', this.addWithdrawel);

        token.getPastEvents('Transfer', {
            filter: { from: address },
            fromBlock: (fromBlock - offset),
            toBlock: 'latest'
        }, (error, events) => {
            this.addMyTransfers(events);
        });

        token.getPastEvents('Transfer', {
            filter: { to: address },
            fromBlock: (fromBlock - offset),
            toBlock: 'latest'
        }, (error, events) => {
            this.addMyTransfers(events);
        });
    }

    getCurrentBlockId() {
        return THX.network.loom.eth.getBlockNumber().then((data: any) => {
            return data;
        });
    }

    addMyTransfers(data: any) {
        const utils = THX.network.loom.utils;

        for (let key in data) {
            const hash = data[key].transactionHash;
            const value = data[key].returnValues;
            const from = (value.from) ? value.from.toLowerCase(): '';
            const to = (value.to) ? value.to.toLowerCase(): '';
            const amount = utils.fromWei(value.value, 'ether');
            const timestamp = data[key].blockTime;

            this._createTransfer(hash, from, to, amount, timestamp);
        }
    }

    addMyTransfer(data: any) {
        const utils = THX.network.loom.utils;
        const value = data.detail;
        const hash  = event.transactionHash;
        const from = (value.from) ? value.from.toLowerCase(): '';
        const to = (value.to) ? value.to.toLowerCase(): '';
        const amount = utils.fromWei(value.value, 'ether');
        const timestamp = event.blockTime;

        this._createTransfer(hash, from, to, amount, timestamp);

        this.$parent.$refs.header.updateBalance();
    }

    _createTransfer(hash: string, from: string, to: string, amount: string, timestamp: string) {
        Vue.set(this.tokenTransfers, hash, {
            hash: hash,
            from: from,
            to: to,
            amount: Number(amount),
            timestamp: timestamp,
        });
    }
}