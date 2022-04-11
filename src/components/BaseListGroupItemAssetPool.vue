<template>
    <b-list-group-item
        :to="`/memberships/${membership.id}/withdrawals`"
        v-if="membership && membership.token"
        class="d-flex justify-content-between align-items-center"
    >
        <div class="mr-auto">
            <i
                class="fas fa-code-branch mr-2"
                :class="{ 'text-success': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong class="mr-1">{{ membership.token.symbol }} Pool</strong>
            <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{ pendingWithdrawalCount }}</b-badge>
            <br />
            <small class="text-muted text-overflow-75">{{ membership.poolAddress }}</small>
        </div>

        <div class="h3 mr-3 m-0">{{ membership.poolBalance }} {{ membership.token.symbol }}</div>
        <b-dropdown variant="white" no-caret toggle-class="d-flex align-items-center" v-if="profile">
            <template #button-content>
                <i class="fas fa-ellipsis-v p-1 ml-0 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
            </template>
            <b-dropdown-item v-b-modal="`modalDepositPool-${membership.id}`">
                Pool Deposit
            </b-dropdown-item>
            <b-dropdown-item :to="`/memberships/${membership.id}/withdrawals`">
                Withdrawals
            </b-dropdown-item>
            <b-dropdown-item :to="`/memberships/${membership.id}/promotions`">
                Promotions
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item disabled class="text-danger" @click="remove()">
                Remove
            </b-dropdown-item>
        </b-dropdown>
        <base-modal-deposit-pool :membership="membership" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IMemberships, Membership } from '@/store/modules/memberships';
import { WithdrawalState } from '@/store/modules/withdrawals';
import BaseModalDepositPool from './modals/ModalDepositPool.vue';

@Component({
    components: {
        BaseModalDepositPool,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class BaseListGroupItemAssetPool extends Vue {
    busy = true;
    pendingWithdrawalCount = 0;

    // getters
    memberships!: IMemberships;
    profile!: UserProfile;

    @Prop() membership!: Membership;

    onClick() {
        this.$bvModal.show(`modalDepositPool-${this.membership?.poolAddress}`);
    }

    mounted() {
        this.$store
            .dispatch('memberships/get', this.membership.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                if (!membership) return;
                this.$store
                    .dispatch('withdrawals/filter', {
                        profile: this.profile,
                        membership,
                        state: WithdrawalState.Pending,
                    })
                    .then(({ pagination }) => {
                        this.pendingWithdrawalCount = pagination?.total;
                    });
            });
    }
}
</script>
