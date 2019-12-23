import { Component, Prop, Vue } from 'vue-property-decorator';
import EventService from '../services/EventService';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';

@Component({
    name: 'home',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
})
export default class Wallet extends Vue {
    public events: any = null;
    public tokenTransfers: any[] = [];

    get orderedTokenTransfers() {
        const arr: any[] = [];
        for (const hash in this.tokenTransfers) {
            arr.unshift(this.tokenTransfers[hash]);
        }

        return arr.reverse();
    }

    constructor() {
        super();

        const THX = window.THX;

        if (THX.network.hasKeys) {
            this.events = new EventService();
            this.init();
        }
    }

    public async init() {
        const THX = window.THX;

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
            toBlock: 'latest',
        }, (error, events) => {
            this.addMyTransfers(events);
        });

        token.getPastEvents('Transfer', {
            filter: { to: address },
            fromBlock: (fromBlock - offset),
            toBlock: 'latest',
        }, (error, events) => {
            this.addMyTransfers(events);
        });
    }

    public getCurrentBlockId() {
        return THX.network.loom.eth.getBlockNumber().then((data: any) => {
            return data;
        });
    }

    public addMyTransfers(data: any) {
        const utils = THX.network.loom.utils;

        for (const key in data) {
            const hash = data[key].transactionHash;
            const value = data[key].returnValues;
            const from = (value.from) ? value.from.toLowerCase() : '';
            const to = (value.to) ? value.to.toLowerCase() : '';
            const amount = utils.fromWei(value.value, 'ether');
            const timestamp = data[key].blockTime;

            this._createTransfer(hash, from, to, amount, timestamp);
        }
    }

    public addMyTransfer(data: any) {
        const utils = THX.network.loom.utils;
        const value = data.detail;
        const hash  = event.transactionHash;
        const from = (value.from) ? value.from.toLowerCase() : '';
        const to = (value.to) ? value.to.toLowerCase() : '';
        const amount = utils.fromWei(value.value, 'ether');
        const timestamp = event.blockTime;

        this._createTransfer(hash, from, to, amount, timestamp);

        this.$parent.$refs.header.updateBalance();
    }

    public _createTransfer(hash: string, from: string, to: string, amount: string, timestamp: string) {
        Vue.set(this.tokenTransfers, hash, {
            hash,
            from,
            to,
            amount: Number(amount),
            timestamp,
        });
    }
}
