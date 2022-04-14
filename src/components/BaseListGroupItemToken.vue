<template>
    <b-list-group-item v-if="membership && token" class="d-flex justify-content-between align-items-center">
        <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="token.name">
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="token.logoURI" class="mr-2" />
            <strong>{{ token.symbol }}</strong>
        </div>

        <div class="h3 mr-3 m-0">
            {{ balance }}
        </div>
        <!-- <b-button variant="primary" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${token.address}`)">
            <i class="fas fa-exchange-alt ml-0 mr-md-2"></i>
            <span class="d-none d-md-inline">Transfer</span>
        </b-button> -->
        <!-- <base-modal-transfer-tokens :token="token" /> -->
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { ERC20 } from '@/store/modules/erc20';
import BaseModalTransferTokens from '@/components/modals/ModalTransferTokens.vue';
import { TNetworks } from '@/store/modules/network';
import { Membership } from '@/store/modules/memberships';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
    }),
})
export default class BaseListGroupItemToken extends Vue {
    busy = true;
    balance = 0;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;

    token: ERC20 | null = null;

    @Prop() membership!: Membership;

    async mounted() {
        this.$store.dispatch('erc20/get', this.membership.erc20).then(async ({ erc20 }: { erc20: ERC20 }) => {
            this.token = erc20;
            this.balance = await this.$store.dispatch('erc20/balanceOf', erc20);
        });
    }
}
</script>
