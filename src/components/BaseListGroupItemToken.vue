<template>
    <b-list-group-item
        :to="`/memberships/${membership.id}/withdrawals`"
        v-if="membership && token"
        class="d-flex justify-content-between align-items-center"
    >
        <div class="mr-auto">
            <i
                class="fas fa-code-branch mr-2"
                :class="{ 'text-success': membership.network, 'text-muted': !membership.network }"
            ></i>
            <strong>{{ token.symbol }}</strong>
            <br />
            <small class="text-muted d-none d-md-inline">{{ token.name }}</small>
        </div>

        <div class="h3 mr-3 m-0">
            {{ balance }}
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import { Membership } from '@/store/modules/memberships';
import { TNetworks } from '@/store/modules/network';

@Component({
    components: {
        'base-modal-transfer-tokens': BaseModalTransferTokens,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
    }),
})
export default class BaseListGroupItemToken extends Vue {
    busy = true;
    balance = 0;
    token: ERC20 | null = null;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;

    @Prop() membership!: Membership;

    mounted() {
        this.$store
            .dispatch('memberships/get', this.membership.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                if (!membership) return;
                const web3 = this.networks[membership.network];
                const { erc20 } = await this.$store.dispatch('erc20/get', {
                    web3,
                    membership,
                    profile: this.profile,
                });
                this.token = erc20;

                if (this.token) {
                    const { balance } = await this.$store.dispatch('erc20/balanceOf', {
                        token: this.token,
                        profile: this.profile,
                    });
                    this.balance = balance;
                }
            });
    }
}
</script>
