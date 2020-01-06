import { Component, Prop, Vue } from 'vue-property-decorator';
import { BSpinner, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Network } from '@/models/Network';
import EventService from '@/services/EventService';
import PoolService from '@/services/PoolService';
import CoinService from '@/services/CoinService';
import { IRewardPools, RewardPool } from '@/models/RewardPool';
import { mapGetters } from 'vuex';

@Component({
    name: 'wallet',
    components: {
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
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

    public loading: boolean = false;
    public events: any = new EventService();
    public poolService!: PoolService;
    public coinService!: CoinService;
    public tokenTransfers: any[] = [];

    private $network!: Network;
    public $store: any;

    public async created() {
        // const token = await this.$network.getExtdevCoinContract(
        //     this.$network.extdev.web3js,
        // );
        // const fromBlock = await this.getCurrentBlockId();
        // const offset = 10000;
        // const address = this.$network.extdev.account;

        // This could becoma a btch when the TX amount gets huge
        // 1. Store my tx hash when doing a transfer
        // 2. Crawl for tx addressed to me and cache tx hashes in db
        // 3. Listen for new tx when app is active and store in db

        this.coinService = new CoinService();

        this.poolService = new PoolService();
        this.poolService.init();

        this.loading = true;

        this.poolService.getMyRewardPools()
            .then((pools: any) => {
                this.loading = false;

                for (const address in pools) {
                    this.getDeposits(pools[address]);
                }
            })
            .catch((err: string) => {
                this.loading = false;
                // alert(`Oops! Your Reward Pools could not be loaded. Did you provide your keys?`);
            });

        // this.events.listen('event.Deposited', this.addDeposit);
        // this.events.listen('event.Withdrawn', this.addWithdrawel);
        //
        // token.getPastEvents('Transfer', {
        //     filter: { from: address },
        //     fromBlock: (fromBlock - offset),
        //     toBlock: 'latest',
        // }, (error: string, events: any) => {
        //     this.addMyTransfers(events);
        // });
        //
        // token.getPastEvents('Transfer', {
        //     filter: { to: address },
        //     fromBlock: (fromBlock - offset),
        //     toBlock: 'latest',
        // }, (error: string, events: any) => {
        //     this.addMyTransfers(events);
        // });
    }

    public async getDeposits(pool: RewardPool) {
        const address = this.$network.extdev.account;
        const fromBlock = await this.getCurrentBlockId()-100;

        pool.contract.getPastEvents('Deposited', {
            filter: { from: address },
            fromBlock: fromBlock,
            toBlock: 'latest',
        }, (error: string, events: any) => {
            console.error(error);
            console.log(events);
            debugger
        });
    }

    public async getCurrentBlockId() {
        return await this.$network.extdev.web3js.eth.getBlockNumber();
    }

    // public addMyTransfers(data: any) {
    //     const utils = this.$network.extdev.web3js.utils;
    //
    //     for (const key in data) {
    //         const hash = data[key].transactionHash;
    //         const value = data[key].returnValues;
    //         const from = (value.from) ? value.from.toLowerCase() : '';
    //         const to = (value.to) ? value.to.toLowerCase() : '';
    //         const amount = utils.fromWei(value.value, 'ether');
    //         const timestamp = data[key].blockTime;
    //
    //         this._createTransfer(hash, from, to, amount, timestamp);
    //     }
    // }

    public addTransfer(data: any) {
        const utils = this.$network.extdev.web3js.utils;
        const value = data.detail;
        const hash  = (event as any).transactionHash;

        const from = (value.from) ? value.from.toLowerCase() : '';
        const to = (value.to) ? value.to.toLowerCase() : '';
        const amount = utils.fromWei(value.value, 'ether');
        const timestamp = (event as any).blockTime;

        Vue.set(this.tokenTransfers, hash, {
            hash,
            from,
            to,
            amount: Number(amount),
            timestamp,
        });
    }
}
