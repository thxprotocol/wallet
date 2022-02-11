<template>
    <div class="container h-100 d-flex flex-column" v-if="profile">
        <b-list-group v-if="web3">
            <base-list-group-item-gas-token />
            <base-list-group-item-token
                :web3="web3"
                :id="membership.id"
                :key="membership.id"
                v-for="membership in memberships"
            />
        </b-list-group>
        <hr />
        <b-button class="mx-auto rounded-pill" variant="primary" :disabled="busy" @click="updateBalances()">
            Reload Balances
        </b-button>
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
import { IMemberships, Membership } from '@/store/modules/memberships';

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
        memberships: 'memberships/all',
    }),
})
export default class Wallet extends Vue {
    busy = false;
    error = '';

    @Prop() npid!: NetworkProvider;

    web3!: Web3;
    profile!: UserProfile;
    privateKey!: string;
    memberships!: IMemberships;

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
            await this.$store.dispatch('memberships/getAll');
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.busy = false;
        }
    }

    async updateBalances() {
        this.busy = true;
        try {
            for (const id in this.memberships) {
                this.$store.dispatch('memberships/get', id).then(async (membership: Membership) => {
                    await this.$store.dispatch('erc20/updateBalance', {
                        web3: this.web3,
                        address: membership.token.address,
                        profile: this.profile,
                    });
                });
                this.$forceUpdate();
            }
        } catch (error) {
            this.error = (error as Error).message;
        } finally {
            this.busy = false;
        }
    }
}
</script>
