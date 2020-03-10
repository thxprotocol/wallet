import { Vue } from 'vue-property-decorator';
import NetworkService from '@/services/NetworkService';
import { Account } from '@/models/Account';
import store from '../store';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export default class CoinService extends Vue {
    public $store: any = store;
    private $account!: Account;
    private $network!: NetworkService;

    public async init() {

        if (this.$network.rinkeby) {
            const rinkebyContract: any = await this.$network.getRinkebyCoinContract();

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
            const extdevContract: any = await this.$network.getExtdevCoinContract();

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

    public async getEthBalance(address: string) {
        const balance = await this.$network.rinkeby.web3js.eth.getBalance(address);
        return new BN(balance).div(TOKEN_MULTIPLIER);
    }

    public async getExtdevBalance(address: string) {
        const contract: any = await this.$network.getExtdevCoinContract();
        const balance = await contract.methods.balanceOf(address).call({ from: this.$network.extdev.account });

        return new BN(balance).div(TOKEN_MULTIPLIER);
    }

    public async getRinkebyBalance(address: string) {
        const contract: any = await this.$network.getRinkebyCoinContract();
        const balance = await contract.methods.balanceOf(address).call({ from: this.$network.rinkeby.account.address });

        return new BN(balance).div(TOKEN_MULTIPLIER);
    }
}
