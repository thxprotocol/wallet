import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { Membership } from './memberships';

export type TPromoCode = {
    id: string;
    sub: string;
    title: string;
    description: string;
    value: string;
    price: number;
    poolAddress: string;
};

export interface IPromoCodes {
    [poolAddress: string]: {
        [pollId: string]: TPromoCode;
    };
}

@Module({ namespaced: true })
class PromoCodeModule extends VuexModule {
    _all: IPromoCodes = {};

    get all() {
        return this._all;
    }

    @Mutation
    set({ promoCode, membership }: { promoCode: TPromoCode; membership: Membership }) {
        if (!this._all[membership.id]) {
            Vue.set(this._all, membership.id, {});
        }
        Vue.set(this._all[membership.id], promoCode.id, promoCode);
    }

    @Mutation
    unset({ promoCode, membership }: { promoCode: TPromoCode; membership: Membership }) {
        Vue.delete(this._all[membership.id], promoCode.id);
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
            method: 'GET',
            url: '/promo_codes',
            params,
            headers: { AssetPool: membership.poolAddress },
        });

        this.context.commit('clear');

        for (const promoCode of r.data.results) {
            this.context.commit('set', { promoCode, membership });
        }

        return { pagination: r.data };
    }
}

export default PromoCodeModule;
