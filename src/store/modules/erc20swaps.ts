import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { Membership } from './memberships';

@Module({ namespaced: true })
class ERC20SwapsModule extends VuexModule {
    @Action({ rawError: true })
    async create({ membership, amountIn, calldata }: { membership: Membership; amountIn: number; calldata: any }) {
        const { call, nonce, sig } = calldata;
        await axios({
            method: 'POST',
            url: '/swaps',
            headers: {
                'X-PoolAddress': membership.poolAddress,
            },
            data: {
                call,
                nonce,
                sig,
                amountIn,
            },
        });

        return true;
    }
}

export default ERC20SwapsModule;
