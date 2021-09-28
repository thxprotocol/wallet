<template>
    <b-list-group-item v-if="token" class="d-flex justify-content-between align-items-center">
        <div class="mr-auto">
            <strong>
                {{ token.symbol }}
            </strong>
            <br />
            <small class="text-muted">{{ token.name }} ({{ provider.name }})</small>
        </div>
        <div class="h3 mr-3 m-0">
            {{ token.balance }}
        </div>
        <b-button variant="primary" v-b-modal="`modalTransferValue-${provider.id}`">Transfer</b-button>
        <base-modal-transfer-value />
    </b-list-group-item>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { GasToken, Network } from '@/store/modules/network';
import BaseModalTranferValue from '@/components/modals/ModalTransferValue.vue';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
        'base-modal-transfer-value': BaseModalTranferValue,
    },
    computed: mapGetters({
        profile: 'account/profile',
        gasToken: 'network/gasToken',
        provider: 'network/current',
    }),
})
export default class BaseListGroupItemGasToken extends Vue {
    // getters
    profile!: UserProfile;
    gasToken!: GasToken;
    provider!: Network;

    get token() {
        return this.gasToken;
    }
}
</script>
