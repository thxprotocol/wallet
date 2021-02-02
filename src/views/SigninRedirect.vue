<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import TorusSdk, { TorusKey } from '@toruslabs/torus-direct-web-sdk';
import { User } from 'oidc-client';

@Component({
    components: {},
    computed: mapGetters({
        user: 'account/user',
    }),
})
export default class Redirect extends Vue {
    user!: User;

    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirectCallback');

            if (this.user) {
                const torus = new TorusSdk({
                    baseUrl: `${location.origin}/serviceworker`,
                    enableLogging: true,
                    network: 'testnet', // details for test net
                });
                const torusKey: TorusKey = await torus.getTorusKey(
                    'thx-email-password-testnet',
                    this.user.profile.sub,
                    { verifier_id: this.user.profile.sub }, // eslint-disable-line @typescript-eslint/camelcase
                    this.user.id_token,
                );
                console.log(torusKey);
                sessionStorage.setItem('thx:wallet:pkey', torusKey.privateKey);
                debugger;
            }
            debugger;

            this.$router.push('/');
        } catch (e) {
            return;
        }
    }
}
</script>
