<template>
    <b-list-group-item
        :to="`/memberships/${membership.id}/withdrawals`"
        class="d-flex justify-content-between align-items-center"
    >
        <div v-if="!membership.token" class="mr-auto">
            <i
                class="fas fa-code-branch mr-2"
                :class="{ 'text-success': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong v-if="!membership.token" class="text-danger mr-1">This Pool is deleted by it owner</strong>
            <small v-if="!membership.token" class="text-muted text-overflow-75">
                {{ membership.id }}
            </small>
        </div>

        <div v-if="membership.token" class="mr-auto">
            <i
                class="fas fa-code-branch mr-2"
                :class="{ 'text-success': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong class="mr-1">{{ membership.token.symbol }} Pool</strong>
            <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{ pendingWithdrawalCount }}</b-badge>
            <br />
            <small class="text-muted text-overflow-75">{{ membership.poolAddress }}</small>
        </div>

        <div v-if="membership.token" class="h3 mr-3 m-0">
            {{ membership.token.balance }} {{ membership.token.symbol }}
        </div>
        <b-dropdown variant="white" no-caret toggle-class="d-flex align-items-center" v-if="profile">
            <template #button-content>
                <i class="fas fa-ellipsis-v p-1 ml-0 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
            </template>
            <b-dropdown-item v-if="membership.token" v-b-modal="`modalDepositPool-${membership.id}`">
                Pool Deposit
            </b-dropdown-item>
            <b-dropdown-item v-if="membership.token" :to="`/memberships/${membership.id}/withdrawals`">
                Withdrawals
            </b-dropdown-item>
            <b-dropdown-item v-if="membership.token" :to="`/memberships/${membership.id}/promotions`">
                Promotions
            </b-dropdown-item>
            <b-dropdown-divider v-if="membership.token" />
            <b-dropdown-item v-b-modal="`modalDeleteMembership-${membership.id}`" class="text-danger">
                Remove
            </b-dropdown-item>
        </b-dropdown>
        <base-modal-deposit-pool v-if="membership.token" :membership="membership" />
        <modal-delete :id="`modalDeleteMembership-${membership.id}`" :call="remove" :subject="membership.id" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IMemberships, Membership } from '@/store/modules/memberships';
import { WithdrawalState } from '@/store/modules/withdrawals';
import BaseModalDepositPool from './modals/ModalDepositPool.vue';
import ModalDelete from './modals/ModalDelete.vue';

@Component({
    components: {
        BaseModalDepositPool,
        ModalDelete,
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
    deleting = false;
    memberships!: IMemberships;
    profile!: UserProfile;

    @Prop() membership!: Membership;

    onClick() {
        this.$bvModal.show(`modalDepositPool-${this.membership?.poolAddress}`);
    }

    toggleDeleteModal() {
        this.deleting = !this.deleting;
    }

    remove() {
        this.$store.dispatch('memberships/delete', this.membership.id);
    }

    mounted() {
        this.$store
            .dispatch('memberships/get', this.membership.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                if (membership) {
                    this.$store
                        .dispatch('withdrawals/filter', {
                            profile: this.profile,
                            membership,
                            state: WithdrawalState.Pending,
                        })
                        .then(({ pagination }) => {
                            this.pendingWithdrawalCount = pagination?.total;
                        });
                }
            });
    }
}
</script>
