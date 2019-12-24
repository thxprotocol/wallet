import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';

const BN = require('bn.js');
const coinMultiplier = new BN(10).pow(new BN(18));

export default class CoinService extends Vue {
    private $network!: Network;

    constructor() {
        super();
    }

    async listen() {
        const contract: any = await this.$network.getExtdevCoinContract(this.$network.rinkeby.web3js)

        contract.events
            .Transfer({
                to: this.$network.rinkeby.account.address,
            }, (error: string, event: any) => {
                console.log(event);
                debugger
                return this.$emit('event.RinkebyTransfer', event.returnValues);
            });

        contract.events
            .Transfer({
                from: this.$network.rinkeby.account.address,
            }, (error: string, event: any) => {
                console.log(event);
                debugger
                return this.$emit('event.RinkebyTransfer', event.returnValues)
            });
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

    async getBalance(address: string) {
        const contract: any = await this.$network.getExtdevCoinContract(this.$network.extdev.web3js);
        const rewardPoolBalance = await contract.methods.balanceOf(address).call({ from: this.$network.extdev.account })

        return new BN(rewardPoolBalance).div(coinMultiplier);
    }
}
