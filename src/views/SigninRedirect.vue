<template>
    <div class="center-center h-100">
        <b-spinner variant="dark"></b-spinner>
        <modal-decode-private-key :web3="web3" @init="init()" />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import ModalDecodePrivateKey from '@/components/modals/ModalDecodePrivateKey.vue';
import { BSpinner } from 'bootstrap-vue';
import { NetworkProvider } from '@/utils/network';
import Web3 from 'web3';
import { User } from 'oidc-client';

@Component({
    components: {
        'b-spinner': BSpinner,
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
    busy = false;
    error = '';
    // getters
    privateKey!: string;
    profile!: UserProfile;
    web3!: Web3;
    user!: User;

    @Prop() npid!: NetworkProvider;

    async mounted() {
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('memberships/getAll');
        await this.$store.dispatch('account/getPrivateKey');
        await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });

        if (this.profile && !this.profile.privateKey) {
            if (!this.profile.address) {
                const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);

                await this.$store.dispatch('account/update', { address: account.address });
                await this.$store.dispatch('account/getProfile');
            }

            if (this.user.state.rewardHash) {
                const { error } = await this.$store.dispatch('assetpools/claimReward', this.user.state.rewardHash);

                if (error) throw new Error(error.message);
            }

            this.init();
            return;
        }

        this.$bvModal.show('modalDecodePrivateKey');
    }

    init() {
        this.$router.push('/account');
    }
}
</script>
