import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';
import { ChainId } from '@/types/enums/ChainId';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { ERC20 } from './erc20';

export interface IERC20SwapRuleData {
    _id: string;
    chainId: ChainId;
    poolAddress: string;
    tokenInId: string;
    tokenInAddress: string;
    tokenMultiplier: number;
    erc20: ERC20;
    erc20Token: ERC20;
}

export class ERC20SwapRuleExtended {
    _id: string;
    chainId: ChainId;
    poolAddress: string;
    tokenInId: string;
    tokenInAddress: string;
    tokenMultiplier: number;
    page: number;
    erc20: ERC20;

    constructor(data: IERC20SwapRuleData, erc20: ERC20, page: number) {
        this._id = data._id;
        this.chainId = data.chainId;
        this.poolAddress = data.poolAddress;
        this.tokenInId = data.tokenInId;
        this.tokenInAddress = data.tokenInAddress;
        this.tokenMultiplier = data.tokenMultiplier;
        this.page = page;
        this.erc20 = erc20;
    }
}

export interface IERC20SwapRules {
    [membershipId: string]: {
        [_id: string]: ERC20SwapRuleExtended;
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

    @Action({ rawError: true })
    async filter({ membership, page = 1, limit = 10 }: { membership: Membership; page: number; limit: number }) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        const swaprules = await axios({
            method: 'get',
            url: '/swaprules',
            params,
            headers: { 'X-PoolId': membership.poolId },
        });

        const promises = [];

        for (const swaprule of swaprules.data.results) {
            const promise = new Promise((resolve, reject) => {
                try {
                    axios({
                        method: 'GET',
                        url: '/erc20/token/' + swaprule.tokenInId,
                    }).then(res => {
                        axios({
                            method: 'GET',
                            url: '/erc20/' + res.data.erc20Id,
                        }).then(({ data }) => {
                            const web3 = this.context.rootGetters['network/all'][data.chainId];
                            const from = this.context.rootGetters['account/profile'].address;
                            const contract = new web3.eth.Contract(ERC20Abi as any, data.address, { from });

                            const erc20 = {
                                ...res.data,
                                contract,
                                balance: 0,
                                blockExplorerURL: `https://${
                                    data.chainId === 80001 ? 'mumbai.' : ''
                                }polygonscan.com/address/${data.address}`,
                                logoURI: `https://avatars.dicebear.com/api/identicon/${data._id}.svg`,
                            };

                            const swaprulePaginated = new ERC20SwapRuleExtended(swaprule, erc20, page);
                            this.context.commit('set', { swaprule: swaprulePaginated, membership });
                            resolve(true);
                        });
                    });
                } catch (err) {
                    reject(err);
                }
            });
            promises.push(promise);
        }
        await Promise.all(promises);
        return { pagination: swaprules.data };
    }
}

export default ERC20SwapRuleModule;
