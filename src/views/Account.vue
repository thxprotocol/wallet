<template>
    <div class="container" v-if="profile">
        <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
        <b-alert show variant="info" dismissible @dismissed="info = ''" v-if="info">{{ info }}</b-alert>
        <h2 class="h4">
            <label for="accountAddress">Your Wallet</label>
        </h2>
        <b-input-group>
            <b-form-input id="accountAddress" readonly :value="profile.address" />
            <b-input-group-append>
                <b-button
                    variant="dark"
                    v-clipboard:copy="profile.address"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                >
                    Copy
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <hr />
        <h2 class="h4">Your Pools</h2>
        <b-list-group v-if="web3">
            <b-list-group-item class="text-center" v-if="busy">
                <b-spinner variant="primary" />
            </b-list-group-item>
            <base-list-group-item-asset-pool
                v-else
                :address="pool.address"
                :key="key"
                v-for="(pool, key) of filteredPools"
            />
        </b-list-group>

        <hr />

        <b-button block variant="dark" @click="logout()">
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseListGroupItemAssetPool from '@/components/BaseListGroupItemAssetPool.vue';
import { NetworkProvider } from '@/utils/network';
import Web3 from 'web3';
import { AssetPool } from '@/store/modules/assetPools';

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
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        web3: 'network/web3',
        assetPools: 'assetpools/all',
    }),
})
export default class AccountView extends Vue {
    busy = true;
    error = '';
    info = '';

    // getters
    user!: User;
    profile!: UserProfile;
    privateKey!: string;
    assetPools!: { [address: string]: AssetPool };
    web3!: Web3;

    @Prop() npid!: NetworkProvider;

    get filteredPools() {
        return Object.values(this.assetPools).filter((pool: AssetPool) => pool.network === this.npid);
    }

    onCopy(e: any) {
        this.info = 'You just copied: ' + e.text;
    }

    onError() {
        this.error = 'Failed to copy texts';
    }

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });

            await this.getAssetPools();
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async getAssetPools() {
        for (const address of this.profile.memberships) {
            try {
                await this.$store.dispatch('assetpools/get', { web3: this.web3, address });
            } catch (e) {
                console.dir(e);
                debugger;
            }
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
