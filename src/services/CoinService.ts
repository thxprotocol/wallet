import { Vue } from 'vue-property-decorator';
import NetworkService from '@/services/NetworkService';
import store from '../store';
import BN from 'bn.js';

const TOKEN_MULTIPLIER = new BN(10).pow(new BN(18));

export default class CoinService extends Vue {
    public $store: any = store;
    private $network!: NetworkService;

    public async listen() {
        if (this.$network.rinkeby) {
            const rinkebyContract: any = await this.$network.getRinkebyCoinContract();
            const rinkebyAddress: string = this.$network.rinkeby.account.address;

            rinkebyContract.events
                .Transfer({
                    to: rinkebyAddress,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'tokenRinkeby',
                        balance: await this.getRinkebyBalance(rinkebyAddress),
                    });
                });

            rinkebyContract.events
                .Transfer({
                    from: rinkebyAddress,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'tokenRinkeby',
                        balance: await this.getRinkebyBalance(rinkebyAddress),
                    });
                });
        }
        if (this.$network.extdev) {
            const extdevContract: any = await this.$network.getExtdevCoinContract();
            const extdevAddress = this.$network.extdev.account;

            extdevContract.events
                .Transfer({
                    to: extdevAddress,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'token',
                        balance: await this.getExtdevBalance(extdevAddress),
                    });
                });

            extdevContract.events
                .Transfer({
                    from: extdevAddress,
                })
                .on('data', async () => {
                    this.$store.commit('updateBalance', {
                        type: 'token',
                        balance: await this.getExtdevBalance(extdevAddress),
                    });
                });
        }
    }

    public async getEthBalance(address: string) {
        const balance = await this.$network.rinkeby.web3js.eth.getBalance(address);

        return this.$network.rinkeby.web3js.utils.fromWei(balance, 'ether');
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
