import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';
import { ChainId } from '@/utils/network';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import Web3 from 'web3';

export interface IERC20SwapRuleData {
    _id: string;
    chainId: ChainId;
    poolAddress: string;
    tokenInId: string;
    tokenInAddress: string;
    tokenMultiplier: number;
    tokenInName: string;
    tokenInSymbol: string;
    //tokenInlogoURI: string;
}

export class ERC20SwapRuleExtended {
    _id: string;
    chainId: ChainId;
    poolAddress: string;
    tokenInId: string;
    tokenInAddress: string;
    tokenMultiplier: number;
    page: number;
    tokenInName: string;
    tokenInSymbol: string;
    //tokenInlogoURI: string;

    constructor(data: IERC20SwapRuleData, tokenName: string, tokenSymbol: string, page: number) {
        this._id = data._id;
        this.chainId = data.chainId;
        this.poolAddress = data.poolAddress;
        this.tokenInId = data.tokenInId;
        this.tokenInAddress = data.tokenInAddress;
        this.tokenMultiplier = data.tokenMultiplier;
        this.page = page;
        this.tokenInName = tokenName;
        this.tokenInSymbol = tokenSymbol;
        //this.tokenInlogoURI = data.tokenInlogoURI;
    }
}

export interface IERC20SwapRules {
    [poolAddress: string]: {
        [pollId: string]: ERC20SwapRuleExtended;
    };
}

@Module({ namespaced: true })
class ERC20SwapRuleModule extends VuexModule {
    _all: IERC20SwapRules = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ swaprule, membership }: { swaprule: ERC20SwapRuleExtended; membership: Membership }) {
        if (!this._all[membership.id]) {
            Vue.set(this._all, membership.id, {});
        }
        Vue.set(this._all[membership.id], swaprule._id, swaprule);
    }

    @Mutation
    unset({ swaprule, membership }: { swaprule: ERC20SwapRuleExtended; membership: Membership }) {
        Vue.delete(this._all[membership.id], swaprule._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async filter({ membership, page = 1, limit = 10 }: { membership: Membership; page: number; limit: number }) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        const r = await axios({
            method: 'get',
            url: '/swaprules',
            params,
            headers: { 'X-PoolAddress': membership.poolAddress },
        });

        this.context.commit('clear');

        for (const swaprule of r.data.results) {
            const web3: Web3 = this.context.rootGetters['network/all'][swaprule.chainId];
            const from = this.context.rootGetters['account/profile'].address;
            const contract = new web3.eth.Contract(ERC20Abi as any, swaprule.tokenInAddress, { from });

            const tokenName = await contract.methods.name().call();
            const tokenSymbol = await contract.methods.symbol().call();
            const swaprulePaginated = new ERC20SwapRuleExtended(swaprule, tokenName, tokenSymbol, page);
            this.context.commit('set', { swaprule: swaprulePaginated, membership });
        }

        return { pagination: r.data };
    }
}

export default ERC20SwapRuleModule;
