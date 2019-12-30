import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import EventService from './EventService';

const BN = require('bn.js');
const coinMultiplier = new BN(10).pow(new BN(18));

export default class CoinService extends Vue {
    private $events!: EventService;
    private $network!: Network;

    public async init() {
        const rinkebyContract: any = await this.$network.getRinkebyCoinContract(this.$network.rinkeby.web3js);
        const extdevContract: any = await this.$network.getExtdevCoinContract(this.$network.extdev.web3js);

        rinkebyContract.events
            .Transfer({
                to: this.$network.rinkeby.account.address,
            }, (error: string, event: any) => {
                return this.$events.dispatch('event.RinkebyTransfer');
            });

        rinkebyContract.events
            .Transfer({
                from: this.$network.rinkeby.account.address,
            }, (error: string, event: any) => {
                return this.$events.dispatch('event.RinkebyTransfer');
            });

        extdevContract.events
            .Transfer({
                to: this.$network.extdev.account,
            }, (error: string, event: any) => {
                return this.$events.dispatch('event.ExtdevTransfer');
            });

        extdevContract.events
            .Transfer({
                from: this.$network.extdev.account,
            }, (error: string, event: any) => {
                return this.$events.dispatch('event.ExtdevTransfer');
            });
    }


    public async getExtdevBalance(address: string) {
        const contract: any = await this.$network.getExtdevCoinContract(this.$network.extdev.web3js);
        const balance = await contract.methods.balanceOf(address).call({ from: this.$network.extdev.account });

        return new BN(balance).div(coinMultiplier);
    }

    public async getRinkebyBalance(address: string) {
        const contract: any = await this.$network.getRinkebyCoinContract(this.$network.extdev.web3js);
        const balance = await contract.methods.balanceOf(address).call({ from: this.$network.rinkeby.account });

        return new BN(balance).div(coinMultiplier);
    }

    //
    // public subscribePoolEvents(events: string[]) {
    //     for (const e of this.poolEvents) {
    //         events[e]({}, (error: string, event: any) => this.dispatch(`event.${e}`, event.returnValues));
    //     }
    // }
    //
    // public subscribeRewardEvents(events: any) {
    //     events.RewardStateChanged({}, (error: string, event: any) => this.dispatch(`event.RewardStateChanged`, event.returnValues));
    // }
}
