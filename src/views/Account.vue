<template>
    <div class="container mt-3" v-if="profile">
        <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
        <h2 class="h4">
            <label for="accountAddress">Wallet address</label>
        </h2>
        <b-input-group>
            <b-form-input id="accountAddress" readonly :value="address" />
            <b-input-group-append>
                <b-button variant="secondary" v-b-modal="'modalSetPrivateKey'">
                    Change
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <hr />
        <h2 class="h4">Memberships</h2>
        <b-list-group>
            <b-list-group-item
                v-b-modal="'modalAssetPool'"
                class="d-flex justify-content-between align-items-center"
                :key="key"
                v-for="(membership, key) of memberships"
            >
                <strong class="mr-auto">{{ membership.title }}</strong>
                <b-badge class="mr-3 text-overflow-75" variant="secondary" pill v-if="membership.address !== address">
                    {{ membership.address }}
                </b-badge>
                <b-badge class="mr-3" variant="secondary" pill v-if="membership.isManager">
                    Manager
                </b-badge>
                <b-badge variant="primary" pill>
                    {{ membership.poolToken.balance.hex | fromBigNumber }} {{ membership.poolToken.symbol }}
                </b-badge>
                <modal-asset-pool :membership="membership" />
            </b-list-group-item>
            <b-list-group-item class="text-center" v-if="busy">
                <b-spinner variant="primary" />
            </b-list-group-item>
        </b-list-group>

        <hr />

        <b-button class="btn-rounded" block variant="link" @click="logout()">
            Logout
        </b-button>
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import {
    BAlert,
    BBadge,
    BButton,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BListGroup,
    BListGroupItem,
    BSpinner,
} from 'bootstrap-vue';
import ModalAssetPool from '@/components/modals/ModalAssetPool.vue';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'AccountView',
    components: {
        'modal-asset-pool': ModalAssetPool,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-alert': BAlert,
        'b-spinner': BSpinner,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        user: 'account/user',
        address: 'account/address',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        memberships: 'memberships/all',
    }),
})
export default class AccountView extends Vue {
    busy = true;
    error = '';

    // getters
    user!: User;
    profile!: UserProfile;
    address!: string;
    privateKey!: string;

    async mounted() {
        this.busy = true;
        try {
            this.$store.commit('network/connect', this.privateKey);
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('memberships/init', this.profile.memberships);
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async logout() {
        try {
            await this.$store.dispatch('account/signoutRedirect');
        } catch (e) {
            return;
        }
    }
}
</script>
