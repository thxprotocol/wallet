import axios from 'axios';
import { TSwapRule } from '@/types/SwapRules';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { TMembership } from './memberships';

@Module({ namespaced: true })
class ERC20SwapsModule extends VuexModule {
    @Action({ rawError: true })
    async create({
        membership,
        swapRule,
        amountInInWei,
        tokenInAddress,
    }: {
        membership: TMembership;
        swapRule: TSwapRule;
        amountInInWei: string;
        tokenInAddress: string;
    }) {
        const { call, nonce, sig } = await this.context.dispatch(
            'network/sign',
            {
                poolAddress: membership.poolAddress,
                name: 'swap',
                params: [amountInInWei, tokenInAddress],
            },
            { root: true },
        );

        await axios({
            method: 'POST',
            url: '/swaps',
            headers: {
                'X-PoolId': membership.poolId,
            },
            data: {
                call,
                nonce,
                sig,
                swapRuleId: swapRule._id,
                amountIn: amountInInWei,
                tokenInAddress,
            },
        });

        return true;
    }
}

export default ERC20SwapsModule;
