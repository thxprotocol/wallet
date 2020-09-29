<template>
    <b-modal
        id="modalDecodeWithdrawPoll"
        class="text-white"
        show
        @shown="onShown"
        centered
        scrollable
        hide-header
        :body-bg-variant="variant"
        :footer-bg-variant="variant"
    >
        <template v-slot:default>
            <div class="w-100 text-center" v-if="busy">
                <b-spinner variant="primary" />
            </div>
            <template v-else>
                <code class="text-white" v-if="tx">{{ tx }}</code>
                <code class="text-white" v-if="err">{{ err }}</code>
            </template>
        </template>
        <template v-slot:modal-footer="{ ok }">
            <b-button class="mt-3" block variant="dark" @click="ok()">
                Close
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BModal } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QR } from '@/utils/network';
import { Transaction } from 'web3/eth/types';

@Component({
    name: 'ModalDecodeWithdrawPoll',
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
})
export default class ModalDecodeWithdrawPoll extends Vue {
    account!: Account;
    busy = true;
    variant = 'light';

    tx: Transaction | null = null;
    err = '';

    @Prop() result!: QR;

    onShown() {
        this.$store
            .dispatch('withdrawals/vote', this.result)
            .then((tx: Transaction) => {
                this.tx = tx;
                this.variant = 'success';
            })
            .catch((err: string) => {
                this.err = err.toString();
                this.variant = 'danger';
            })
            .finally(() => {
                this.busy = false;
            });
    }
}
</script>
