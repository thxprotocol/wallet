<template>
    <b-list-group-item v-if="token" class="d-flex justify-content-between align-items-center">
        <div class="mr-auto">
            <strong>{{ token.symbol }}</strong
            ><br />
            <small class="text-muted">{{ token.name }}</small>
        </div>

        <div class="h3 mr-3 m-0">
            {{ token.balance }}
        </div>
        <b-button variant="primary" v-b-modal="`modalTransferTokens-${token.address}`">Transfer</b-button>
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

    // getters
    profile!: UserProfile;
    erc20!: { [address: string]: ERC20 };

    @Prop() web3!: Web3;
    @Prop() address!: string;

    get token() {
        return this.erc20[this.address];
    }

    async mounted() {
        try {
            this.$store.dispatch('erc20/get', {
                web3: this.web3,
                address: this.address,
                profile: this.profile,
            });
        } catch (e) {
            console.log(e);
            debugger;
        }
    }
}
</script>
