<template>
    <b-list-group-item
        v-if="token"
        :to="membership.erc20 ? `/memberships/${membership.id}/withdrawals` : null"
        class="d-flex justify-content-between align-items-center"
    >
        <div class="mr-auto">
            <i
                v-b-tooltip
                :title="ChainId[membership.chainId]"
                class="fas mr-2 text-primary"
                :class="{
                    'fa-coins': membership.erc20,
                    'fa-palette': membership.erc721,
                }"
            ></i>
            <strong class="mr-1">{{ token.symbol }} Pool</strong>
            <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{ pendingWithdrawalCount }}</b-badge>
            <br />
            <small class="text-muted">{{ membership.poolBalance }} {{ token.symbol }}</small>
        </div>
        <b-dropdown variant="white" no-caret toggle-class="d-flex align-items-center" v-if="profile">
            <template #button-content>
                <i class="fas fa-ellipsis-v p-1 ml-0 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
            </template>
            <b-dropdown-item-button @click.prevent="window.open(token.blockExplorerUrl, '_blank')">
                <span class="text-muted">
                    <i class="fas fa-external-link-alt mr-2"></i>
                    Block Explorer
                </span>
            </b-dropdown-item-button>
            <b-dropdown-item v-b-modal="`modalDepositPool-${membership.id}`" v-if="membership.erc20">
                <span class="text-muted">
                    <i class="fas fa-download mr-2"></i>
                    Deposit
                </span>
            </b-dropdown-item>
            <b-dropdown-item :to="`/memberships/${membership.id}/withdrawals`" v-if="membership.erc20">
                <span class="text-muted">
                    <i class="fas fa-upload mr-2"></i>
                    Withdrawals
                </span>
            </b-dropdown-item>
            <b-dropdown-item :to="`/memberships/${membership.id}/promotions`" v-if="membership.erc20">
                <span class="text-muted">
                    <i class="fas fa-tags mr-2"></i>
                    Promotions
                </span>
            </b-dropdown-item>
            <b-dropdown-divider v-if="membership.erc20" />
            <b-dropdown-item v-b-modal="`modalDeleteMembership-${membership.id}`" class="text-danger">
                <span class="text-muted">
                    <i class="fas fa-trash-alt mr-2"></i>
                    Remove
                </span>
            </b-dropdown-item>
        </b-dropdown>
        <base-modal-deposit-pool :membership="membership" />
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
import { ERC721 } from '@/store/modules/erc721';
import { ChainId } from '@/utils/network';

@Component({
    components: {
        BaseModalDepositPool,
        ModalDelete,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
        erc20s: 'erc20/all',
        erc721s: 'erc721/all',
    }),
})
export default class BaseListGroupItemMembership extends Vue {
    window = window;
    ChainId = ChainId;
    busy = true;
    pendingWithdrawalCount = 0;

    profile!: UserProfile;
    memberships!: IMemberships;
    erc20s!: { [id: string]: ERC20 };
    erc721s!: { [id: string]: ERC721 };

    @Prop() membership!: Membership;

    get token() {
        if (this.membership.erc20) return this.erc20s[this.membership.erc20];
        return this.erc721s[this.membership.erc721];
    }

    remove() {
        this.$store.dispatch('memberships/delete', this.membership.id);
    }

    mounted() {
        this.$store.dispatch('memberships/get', this.membership.id).then(async () => {
            if (this.membership.erc20) {
                await this.$store.dispatch('erc20/get', this.membership.erc20);

                this.$store
                    .dispatch('withdrawals/filter', {
                        profile: this.profile,
                        membership: this.membership,
                        state: WithdrawalState.Pending,
                    })
                    .then(({ pagination }) => {
                        this.pendingWithdrawalCount = pagination?.total;
                    });
            }
            if (this.membership.erc721) {
                this.$store.dispatch('erc721/get', this.membership.erc721);
            }
        });
    }
}
</script>
