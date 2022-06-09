<template>
    <div>
        {{ isConnected ? 'connected' : 'not connected' }}
        {{ account }}
        <b-button @click="connect" :disabled="isConnected">Connect metamask </b-button><br />
        {{ chainId }}
        <template v-if="isConnected">
            <b-button v-if="payment" @click="switchNetwork(payment.chainId)" :disabled="!isConnected">
                Switch network
            </b-button>
            <hr />
            <p>
                The <strong v-b-tooltip :title="payment.receiver">{{ payment.tokenSymbol }} Pool</strong> has send you a
                payment request.
            </p>
            <b-button variant="primary" block class="rounded-pill">
                Pay <strong> {{ payment.amount }} {{ payment.tokenSymbol }} </strong>.
            </b-button>
            <b-button variant="link" block class="rounded-pill" :href="payment.cancelUrl">
                Cancel payment
            </b-button>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

@Component({
    computed: {
        ...mapState('metamask', ['account', 'chainId']),
        ...mapState('payments', ['payment']),
        ...mapGetters('metamask', ['isConnected']),
    },
})
export default class Payment extends Vue {
    account!: string;
    chainId!: number;
    payment!: Payment;

    async connect() {
        this.$store.dispatch('metamask/connect');
    }

    async switchNetwork(networkId: number) {
        this.$store.dispatch('metamask/requestSwitchNetwork', networkId);
    }

    created() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');
        this.$store
            .dispatch('payments/read', {
                paymentId: this.$route.params.id,
                accessToken: this.$route.query.accessToken,
            })
            .then(() => {
                // Connect metamask
                // Check network
                // Check balance for user
            });
    }
}
</script>
