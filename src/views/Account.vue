<template>
    <div class="container" v-if="profile">
        <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
        <b-alert show variant="info" dismissible @dismissed="info = ''" v-if="info">{{ info }}</b-alert>
        <h2 class="h4">
            <label for="accountAddress">Your Wallet</label>
        </h2>
        <b-input-group>
            <b-form-input id="accountAddress" readonly :value="address" />
            <b-input-group-append>
                <b-button
                    variant="secondary"
                    v-clipboard:copy="address"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                >
                    Copy
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <hr />
        <h2 class="h4">Your Pools</h2>
        <b-list-group>
            <base-list-group-item-asset-pool
                :poolAddress="poolAddress"
                :key="key"
                v-for="(poolAddress, key) of profile.memberships"
            />
            <b-list-group-item class="text-center" v-if="busy">
                <b-spinner variant="primary" />
            </b-list-group-item>
        </b-list-group>

        <hr />

        <b-button block variant="secondary" @click="logout()">
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
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseListGroupItemAssetPool from '@/components/BaseListGroupItemAssetPool.vue';

@Component({
    name: 'AccountView',
    components: {
        'base-list-group-item-asset-pool': BaseListGroupItemAssetPool,
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
    info = '';

    // getters
    user!: User;
    profile!: UserProfile;
    address!: string;
    privateKey!: string;

    onCopy(e: any) {
        this.info = 'You just copied: ' + e.text;
    }

    onError() {
        this.error = 'Failed to copy texts';
    }

    async mounted() {
        this.busy = true;

        try {
            this.$store.commit('network/connect', this.privateKey);
            await this.$store.dispatch('account/getProfile');
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
