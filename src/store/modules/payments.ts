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
    tokenSymbol: string;
    tokenAddress: string;
    poolId: string;
    chainId: number;
    sender: string;
    receiver: string;
    transactions: string[];
    state: PaymentState;
    token: string;
    paymentUrl: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
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

    @Action({ rawError: true })
    async pay(data: { call: string; nonce: string; sig: string; amount: string }) {
        if (!this.payment) return;

        const r = await axios({
            method: 'POST',
            url: '/payments/' + this.payment._id + '/pay',
            headers: { 'X-PoolAddress': this.payment.receiver, 'X-Payment-Token': this.payment.token },
            data,
        });

        this.context.commit('set', r.data);
    }
}

export default PaymentModule;
