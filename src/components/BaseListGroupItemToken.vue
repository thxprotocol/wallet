<template>
    <b-list-group-item v-if="token" class="d-flex justify-content-between align-items-center">
        <div class="mr-auto">
            <i
                class="fas fa-certificate mr-2"
                :class="{ 'text-primary': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong>{{ token.symbol }}</strong>
            <br />
            <small class="text-muted d-none d-md-inline">{{ token.name }}</small>
        </div>

        <div class="h3 mr-3 m-0">
            {{ token.balance | abbrNumber }}
            <small class="text-muted" v-if="membership.pendingBalance > 0">
                ({{ membership.pendingBalance | abbrNumber }})
            </small>
        </div>
        <b-button variant="primary" size="sm" v-b-modal="`modalTransferTokens-${token.address}`">
            <i class="fas fa-exchange-alt ml-0 mr-md-2"></i>
            <span class="d-none d-md-inline">Transfer</span>
        </b-button>
        <base-modal-transfer-tokens :token="token" />
    </b-list-group-item>
</template>

<script lang="ts">
import Web3 from 'web3';
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import { Membership } from '@/store/modules/memberships';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
        'base-modal-transfer-tokens': BaseModalTransferTokens,
    },
    computed: mapGetters({
        profile: 'account/profile',
        erc20: 'erc20/all',
    }),
})
export default class BaseListGroupItemToken extends Vue {
    busy = true;
    membership: Membership | null = null;

    // getters
    profile!: UserProfile;
    erc20!: { [address: string]: ERC20 };

    @Prop() web3!: Web3;
    @Prop() id!: string;

    get token() {
        return this.erc20[this.membership?.token?.address];
    }

    async mounted() {
        try {
            this.membership = await this.$store.dispatch('memberships/get', this.id);
            this.$store.dispatch('erc20/get', {
                web3: this.web3,
                address: this.membership?.token.address,
                profile: this.profile,
            });
        } catch (e) {
            console.log(e);
        }
    }
}
</script>
