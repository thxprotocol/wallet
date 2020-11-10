<template>
    <b-modal
        id="modalDecodeBasePoll"
        class="text-white"
        show
        @show="onShow"
        centered
        scrollable
        hide-header
        :body-bg-variant="variant"
        :footer-bg-variant="variant"
    >
        <template v-slot:default>
            <div class="w-100 text-center" v-if="busy">
                <b-spinner variant="dark" />
            </div>
            <template v-else>
                <div v-if="result.method === 'vote'">
                    <p class="text-white h4 mb-3">
                        You have cast your <strong>{{ result.params.agree ? 'yes' : 'no' }}</strong> vote for
                        <strong>{{ result.contract }}</strong>
                        <small class="text-overflow-200">{{ result.contractAddress }}</small>
                    </p>
                </div>
                <div v-if="result.method === 'revokeVote'">
                    <p class="text-white h4 mb-3">
                        You have revoked your vote for <strong>{{ result.contract }}</strong>
                        <small class="text-overflow-200">{{ result.contractAddress }}</small>
                    </p>
                </div>
                <!-- <small class="h-20">
                    <code class="text-white" v-if="tx">{{ tx }}</code>
                    <code class="text-white" v-if="err">{{ err }}</code>
                </small> -->
            </template>
        </template>
        <template v-slot:modal-footer="{ ok }">
            <b-button class="mt-3 btn-rounded" block variant="dark" @click="ok()">
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
    name: 'ModalDecodeBasePoll',
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
})
export default class ModalDecodeBasePoll extends Vue {
    account!: Account;
    busy = true;
    variant = 'light';
    tx: Transaction | null = null;
    err = '';

    @Prop() result!: QR;

    async onShow() {
        const allowedMethods = ['vote', 'revokeVote'];

        this.variant = 'light';
        this.busy = true;

        if (allowedMethods.includes(this.result.method)) {
            try {
                this.tx = await this.$store.dispatch(`polls/${this.result.method}`, this.result);
                this.variant = 'success';
            } catch (err) {
                this.err = err.toString();
                this.variant = 'danger';
            } finally {
                this.busy = false;
            }
        }
    }
}
</script>
