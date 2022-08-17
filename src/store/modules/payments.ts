import axios from 'axios';
import { TPayment } from '@/types/Payments';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';

@Module({ namespaced: true })
class PaymentModule extends VuexModule {
    payment: TPayment | null = null;

    @Mutation
    set(payment: TPayment) {
        this.payment = payment;
    }

    @Action({ rawError: true })
    async read(payload: { accessToken: string; paymentId: string }) {
        const r = await axios({
            method: 'GET',
            url: '/payments/' + payload.paymentId,
            headers: {
                'X-Payment-Token': payload.accessToken,
            },
        });

        if (r.data.metadataId) {
            const { data } = await axios({
                method: 'GET',
                url: `/metadata/${r.data.metadataId}`,
            });
            if (data) {
                r.data.metadata = data;
            }
        }

        this.context.commit('set', r.data);

        return r.data;
    }

    @Action({ rawError: true })
    async pay() {
        if (!this.payment) return;

        const r = await axios({
            method: 'POST',
            url: '/payments/' + this.payment._id + '/pay',
            headers: {
                'X-PoolId': this.payment.poolId,
                'X-Payment-Token': this.payment.token,
            },
        });

        this.context.commit('set', r.data);
    }
}

export default PaymentModule;
