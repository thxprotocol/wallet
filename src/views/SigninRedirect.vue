<template>
    <div class="center-center flex-column h-100">
        <div class="flex-row text-center" v-if="isClaimInvalid || isClaimFailed">
            <b-alert show variant="info" v-if="isClaimInvalid">
                {{ error }}
            </b-alert>
            <b-alert show variant="danger" v-if="isClaimFailed">
                Oops, we did not manage to claim your token reward at this time, please try again later.
            </b-alert>
            <b-button variant="primary" class="rounded-pill" @click="claimReward()" v-if="isClaimFailed">
                Try again
            </b-button>
            <b-button variant="link" @click="redirect()">Continue</b-button>
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
            <b-spinner variant="primary" size="lg"></b-spinner><br />
            <span class="text-muted">{{ info }}</span>
        </template>
        <modal-show-withdrawal @redirect="redirect()" :withdrawal="withdrawal" v-if="withdrawal" />
        <modal-decode-private-key @init="redirect()" />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { NetworkProvider } from '@/utils/network';
import { User } from 'oidc-client';
import ModalDecodePrivateKey from '@/components/modals/ModalDecodePrivateKey.vue';
import ModalShowWithdrawal from '@/components/modals/ModalShowWithdrawal.vue';
import { TNetworks } from '@/store/modules/network';
import Web3 from 'web3';

@Component({
    components: {
        ModalShowWithdrawal,
        ModalDecodePrivateKey,
    },
    computed: mapGetters({
        privateKey: 'account/privateKey',
        profile: 'account/profile',
        user: 'account/user',
        networks: 'network/all',
    }),
})
export default class Redirect extends Vue {
    error = '';
    info = '';
    redirectPath = '/memberships';
    isClaimFailed = false;
    isClaimInvalid = false;

    withdrawal = null;

    // getters
    privateKey!: string;
    profile!: UserProfile;
    networks!: TNetworks;
    user!: User;

    async mounted() {
        await this.redirectCallback();

        if (!this.user) {
            await this.$store.dispatch('account/signinRedirect');
        }

        await this.getProfile();

        // Check for non custodial account and return
        if (this.profile && this.profile.privateKey) {
            await this.setNetwork(this.profile.privateKey);
            return this.$bvModal.show('modalDecodePrivateKey');
        }

        await this.getPrivateKey();
        await this.setNetwork(this.privateKey);

        // Check for first time login
        if (this.profile) {
            await this.updateAccount();
        }

        // Check for reward hash in state
        if (this.user.state?.rewardHash) {
            await this.claimReward();
        }

        if (!this.error && !this.isClaimFailed && !this.isClaimInvalid && !this.withdrawal) this.redirect();
    }

    redirect() {
        this.$router.push(this.redirectPath);
    }

    async setNetwork(privateKey: string) {
        this.info = 'Initializing blockchain networks...';
        await this.$store.dispatch('network/setNetwork', { npid: NetworkProvider.Test, privateKey });
        await this.$store.dispatch('network/setNetwork', { npid: NetworkProvider.Main, privateKey });
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
        this.info = 'Fetching private key from Web3Auth...';
        const { error } = await this.$store.dispatch('account/getPrivateKey', this.user);
        if (error) this.error = error.message;
    }

    async claimReward() {
        this.isClaimFailed = false;
        this.isClaimInvalid = false;
        this.info = 'Claiming your token reward...';

        const { withdrawal, error } = await this.$store.dispatch('assetpools/claimReward', this.user.state.rewardHash);

        if (error) {
            this.error = error.response.data.error.message;
            this.isClaimFailed = error.response?.status === 500;
            this.isClaimInvalid = error.response?.status === 403;
        } else {
            this.withdrawal = withdrawal;
        }
    }

    async updateAccount() {
        this.info = 'Updating your account details with a new address...';

        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(this.privateKey);

        if (!this.profile.address || this.profile.address !== account.address) {
            const error = await this.$store.dispatch('account/update', { address: account.address });
            if (error) this.error = error.message;
        }
    }

    async getProfile() {
        this.info = 'Fetching your account details...';
        await this.$store.dispatch('account/getProfile');
    }
}
</script>
