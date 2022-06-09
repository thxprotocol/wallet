import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';

enum PaymentState {
    Pending = 0,
    Completed = 1,
}

export interface IPayments {
    [id: string]: TPayment;
}

export type TPayment = {
    _id: string;
    amount: string;
    tokenAddress: string;
    poolId: string;
    chainId: number;
    sender: string;
    receiver: string;
    transactions: string[];
    state: PaymentState;
    paymentUrl: string;
    returnUrl: string;
    createdAt: Date;
    updatedAt: Date;
};

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
            headers: { 'X-Payment-Token': payload.accessToken },
        });

        this.context.commit('set', r.data);
    }
}

export default PaymentModule;
