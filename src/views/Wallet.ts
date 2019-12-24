import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';

@Component({
    name: 'home',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
})
export default class Wallet extends Vue {

    get orderedTokenTransfers() {
        const arr: any[] = [];
        for (const hash in this.tokenTransfers) {
            arr.unshift(this.tokenTransfers[hash]);
        }

        return arr.reverse();
    }
    public events: any = null;
    public tokenTransfers: any[] = [];
    private $network!: Network;

    public async created() {
        const token = await this.$network.getExtdevCoinContract(
            this.$network.extdev.web3js,
        );
        const fromBlock = await this.getCurrentBlockId();
        const offset = 10000;
        const address = this.$network.extdev.account;

        (this.$parent.$refs.header as any).updateBalance();

        this.events.listen('event.Transfer', this.addMyTransfer);
        // this.events.listen('event.Deposited', this.addDeposit);
        // this.events.listen('event.Withdrawn', this.addWithdrawel);

        token.getPastEvents('Transfer', {
            filter: { from: address },
            fromBlock: (fromBlock - offset),
            toBlock: 'latest',
        }, (error: string, events: any) => {
            this.addMyTransfers(events);
        });

        token.getPastEvents('Transfer', {
            filter: { to: address },
            fromBlock: (fromBlock - offset),
            toBlock: 'latest',
        }, (error: string, events: any) => {
            this.addMyTransfers(events);
        });
    }

    public getCurrentBlockId() {
        return this.$network.extdev.web3js.eth.getBlockNumber().then((data: any) => {
            return data;
        });
    }

    public addMyTransfers(data: any) {
        const utils = this.$network.extdev.web3js.utils;

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
        const utils = this.$network.extdev.web3js.utils;
        const value = data.detail;
        const hash  = (event as any).transactionHash;
        const from = (value.from) ? value.from.toLowerCase() : '';
        const to = (value.to) ? value.to.toLowerCase() : '';
        const amount = utils.fromWei(value.value, 'ether');
        const timestamp = (event as any).blockTime;

        this._createTransfer(hash, from, to, amount, timestamp);

        (this.$parent.$refs.header as any).updateBalance();
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
