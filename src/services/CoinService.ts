import { Vue } from 'vue-property-decorator';
import { Network } from '@/models/Network';
import { Account } from '@/models/Account';
import EventService from './EventService';
import store from '../store';

const BN = require('bn.js');
const coinMultiplier = new BN(10).pow(new BN(18));

export default class CoinService extends Vue {

    public $store: any = store;
    private $account!: Account;
    private $events!: EventService;
    private $network!: Network;

    public async init() {

        if (this.$network.rinkeby) {
            const rinkebyContract: any = await this.$network.getRinkebyCoinContract(this.$network.rinkeby.web3js);

            rinkebyContract.events
                .Transfer({
                    to: this.$network.rinkeby.account.address,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'tokenRinkeby',
                        balance: await this.$account.getRinkebyCoinBalance(),
                    });
                });

            rinkebyContract.events
                .Transfer({
                    from: this.$network.rinkeby.account.address,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'tokenRinkeby',
                        balance: await this.$account.getRinkebyCoinBalance(),
                    });
                });
        }

        if (this.$network.extdev) {
            const extdevContract: any = await this.$network.getExtdevCoinContract(this.$network.extdev.web3js);

            extdevContract.events
                .Transfer({
                    to: this.$network.extdev.account,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'token',
                        balance: await this.$account.getExtdevCoinBalance(),
                    });
                });

            extdevContract.events
                .Transfer({
                    from: this.$network.extdev.account,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'token',
                        balance: await this.$account.getExtdevCoinBalance(),
                    });
                });
        }
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
}
