<template>
    <div class="center-center flex-column h-100">
        <div class="flex-row text-center" v-if="isClaimInvalid || isClaimFailed">
            <p v-if="isClaimInvalid">
                You are not elegible for this token reward claim.
            </p>
            <p v-if="isClaimFailed">
                Oops, we did not manage to claim your token reward at this time due to high network usage, please try
                again later.
            </p>
            <b-button variant="primary" class="rounded-pill" @click="claimReward()">Retry</b-button>
            <b-button variant="link" @click="redirect()">Skip</b-button>
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
            <b-spinner variant="primary" size="lg"></b-spinner><br />
            <span class="text-muted">{{ info }}</span>
        </template>
        <modal-decode-private-key :web3="web3" @init="redirect()" />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import ModalDecodePrivateKey from '@/components/modals/ModalDecodePrivateKey.vue';
import { BSpinner, BAlert, BButton } from 'bootstrap-vue';
import { NetworkProvider } from '@/utils/network';
import Web3 from 'web3';
import { User } from 'oidc-client';

@Component({
    components: {
        BButton,
        BSpinner,
        BAlert,
        'modal-decode-private-key': ModalDecodePrivateKey,
    },
    computed: mapGetters({
        privateKey: 'account/privateKey',
        profile: 'account/profile',
        user: 'account/user',
        web3: 'network/web3',
    }),
})
export default class Redirect extends Vue {
    error = '';
    info = '';
    redirectPath = '/wallet';
    isClaimFailed = false;
    isClaimInvalid = false;

    // getters
    privateKey!: string;
    profile!: UserProfile;
    web3!: Web3;
    user!: User;

    @Prop() npid!: NetworkProvider;

    async mounted() {
        await this.redirectCallback();
        await this.getProfile();

        // Check for non custodial account and return
        if (this.profile && this.profile.privateKey) {
            await this.setNetwork(this.profile.privateKey);
            return this.$bvModal.show('modalDecodePrivateKey');
        }

        await this.getPrivateKey();
        await this.setNetwork(this.privateKey);

        // Check for first time login
        if (!this.profile.address) {
            await this.setPrivateKey();
        }

        // Check for reward hash in state
        if (this.user.state?.rewardHash) {
            await this.claimReward();
        }

        if (!this.error && !this.isClaimFailed && !this.isClaimInvalid) this.redirect();
    }

    redirect() {
        this.$router.push(this.redirectPath);
    }

    async setNetwork(privateKey: string) {
        this.info = 'Authenticating your account...';
        await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey });
    }

    async redirectCallback() {
        this.info = 'Authenticating your account...';
        await this.$store.dispatch('account/signinRedirectCallback');
    }

    async getMemberships() {
        this.info = 'Fetching memberships for your account...';
        const { error } = await this.$store.dispatch('memberships/getAll');
        if (error) this.error = error.message;
    }

    async getPrivateKey() {
        this.info = 'Fetching private key from Torus...';
        const { error } = await this.$store.dispatch('account/getPrivateKey');
        if (error) this.error = error.message;
    }

    async claimReward() {
        this.isClaimFailed = false;
        this.isClaimInvalid = false;
        this.info = 'Claiming your token reward...';

        const { error } = await this.$store.dispatch('assetpools/claimReward', this.user.state.rewardHash);

        if (error) {
            this.isClaimFailed = error.response?.status === 500;
            this.isClaimInvalid = error.response?.status === 403;
        } else {
            this.redirect();
        }
    }

    async setPrivateKey() {
        this.info = 'Updating your account details with a new address...';
        const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
        const { error } = await this.$store.dispatch('account/update', { address: account.address });
        if (error) this.error = error.message;
    }
    async getProfile() {
        this.info = 'Fetching your account details...';
        const { error } = await this.$store.dispatch('account/getProfile');
        if (error) this.error = error.message;
    }
}
</script>
