<template>
    <div class="container" v-if="profile">
        <b-list-group v-if="web3">
            <base-list-group-item-gas-token />
            <base-list-group-item-token
                :web3="web3"
                :address="token.address"
                :key="token.address + token.network"
                v-for="token in filteredTokens"
            />
        </b-list-group>
    </div>
</template>

<script lang="ts">
import Web3 from 'web3';
import BaseListGroupItemToken from '@/components/BaseListGroupItemToken.vue';
import BaseListGroupItemGasToken from '@/components/BaseListGroupItemGasToken.vue';
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { NetworkProvider } from '@/utils/network';
import { ERC20Token } from '@/store/modules/erc20';

@Component({
    components: {
        'b-alert': BAlert,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
        'b-list-group-item': BListGroupItem,
        'base-list-group-item-token': BaseListGroupItemToken,
        'base-list-group-item-gas-token': BaseListGroupItemGasToken,
    },
    computed: mapGetters({
        web3: 'network/web3',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class Wallet extends Vue {
    busy = false;
    error = '';

    @Prop() npid!: NetworkProvider;

    web3!: Web3;
    profile!: UserProfile;
    privateKey!: string;

    get filteredTokens() {
        return Object.values(this.profile.erc20).filter((token: ERC20Token) => token.network === this.npid);
    }

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
