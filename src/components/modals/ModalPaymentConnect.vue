<template>
    <b-modal
        title="Connect payment account"
        id="modalPaymentConnect"
        body-bg-variant="light"
        no-close-on-backdrop
        no-close-on-esc
        centered
        scrollable
        hide-footer
        hide-header
        hide-header-close
    >
        <b-form-group class="mb-0">
            <b-form-radio @change="signin()">
                <strong class="text-primary">Connect THX Account</strong>
                <p>Use your THX account for this payment and we'll cover your gas costs.</p>
            </b-form-radio>
            <b-form-radio @change="connect()" class="mb-0">
                <strong class="text-primary"> Connect Metamask <b-badge variant="primary">Beta</b-badge> </strong>
                <p>
                    Use your Metamask wallet to sign the payment and we will cover your gas costs.
                </p>
                <small class="text-muted">
                    A small MATIC fee does apply when you need to approve us to do the transfer.
                </small>
            </b-form-radio>
        </b-form-group>
    </b-modal>
</template>
<script lang="ts">
import { ChainId } from '@/types/enums/ChainId';
import { TPayment } from '@/types/Payments';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    computed: {},
})
export default class Payment extends Vue {
    @Prop() chainId!: ChainId;
    @Prop() payment!: TPayment;
    @Prop() isConnected!: boolean;

    async signin() {
        const toPath = window.location.href.substring(window.location.origin.length);
        this.$store.dispatch('account/signinRedirect', { toPath });
    }

    async connect() {
        await this.$store.dispatch('network/connect', this.payment.chainId);

        if (this.chainId !== this.payment.chainId) {
            await this.$store.dispatch('network/requestSwitchNetwork', this.payment.chainId);
        }

        this.$emit('connected');
        this.$bvModal.hide('modalPaymentConnect');
    }
}
</script>
