<template>
    <b-list-group-item
        v-if="token"
        :to="`/memberships/${membership.id}/withdrawals`"
        class="d-flex justify-content-between align-items-center"
    >
        <div class="mr-auto">
            <i
                class="fas fa-code-branch mr-2"
                :class="{ 'text-success': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong class="mr-1">{{ token.symbol }} Pool</strong>
            <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{ pendingWithdrawalCount }}</b-badge>
            <br />
            <small class="text-muted text-overflow-75">{{ membership.poolAddress }}</small>
        </div>
        <div class="h3 mr-3 m-0">{{ membership.poolBalance }} {{ token.symbol }}</div>
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
            <b-dropdown-item v-b-modal="`modalDeleteMembership-${membership.id}`" class="text-danger">
                Remove
            </b-dropdown-item>
        </b-dropdown>
        <base-modal-deposit-pool v-if="token" :membership="membership" />
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
import { ERC20 } from '@/store/modules/erc20';

@Component({
    components: {
        BaseModalDepositPool,
        ModalDelete,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
        erc20s: 'erc20/all',
    }),
})
export default class BaseListGroupItemAssetPool extends Vue {
    busy = true;
    pendingWithdrawalCount = 0;
    memberships!: IMemberships;
    profile!: UserProfile;
    token: ERC20 | null = null;

    @Prop() membership!: Membership;

    remove() {
        this.$store.dispatch('memberships/delete', this.membership.id);
    }

    mounted() {
        this.$store
            .dispatch('memberships/get', this.membership.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                const { erc20 } = await this.$store.dispatch('erc20/get', this.membership.erc20);
                this.token = erc20;
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
