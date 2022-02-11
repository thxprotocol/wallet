<template>
    <b-list-group-item
        :to="`/memberships/${membership.id}`"
        v-if="membership"
        class="d-flex justify-content-between align-items-center"
    >
        <div class="mr-auto">
            <i
                class="fas fa-certificate mr-2"
                :class="{ 'text-primary': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong class="mr-1">{{ membership.token.symbol }} Pool</strong>
            <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{ pendingWithdrawalCount }}</b-badge>
            <br />
            <small class="text-muted text-overflow-75">{{ membership.poolAddress }}</small>
        </div>

        <div class="h3 mr-3 m-0">{{ membership.token.balance }} {{ membership.token.symbol }}</div>
        <b-button variant="primary" v-on:click.prevent="onClick()">Deposit</b-button>
        <base-modal-deposit-pool :membership="membership" :web3="web3" />
    </b-list-group-item>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import BaseModalDepositPool from '@/components/modals/ModalDepositPool.vue';
import Web3 from 'web3';
import { IMemberships, Membership } from '@/store/modules/memberships';
import { WithdrawalState } from '@/store/modules/withdrawals';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
        'base-modal-deposit-pool': BaseModalDepositPool,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
        web3: 'network/web3',
    }),
})
export default class BaseListGroupItemAssetPool extends Vue {
    busy = true;
    pendingWithdrawalCount = 0;
    membership: Membership | null = null;

    // getters
    memberships!: IMemberships;
    profile!: UserProfile;
    web3!: Web3;

    @Prop() id!: string;

    onClick() {
        this.$bvModal.show(`modalDepositPool-${this.membership?.poolAddress}`);
    }

    async mounted() {
        this.membership = await this.$store.dispatch('memberships/get', this.id);
        this.$store
            .dispatch('withdrawals/filter', {
                profile: this.profile,
                membership: this.membership,
                state: WithdrawalState.Pending,
            })
            .then(({ pagination }) => {
                this.pendingWithdrawalCount = pagination.total;
            });
    }
}
</script>
