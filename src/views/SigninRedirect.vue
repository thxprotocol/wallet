<template>
    <div><modal-decode-private-key @init="init()" /></div>
</template>

<script lang="ts">
import { UserProfile } from '@/store/modules/account';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import ModalDecodePrivateKey from '@/components/modals/ModalDecodePrivateKey.vue';

@Component({
    components: { 'modal-decode-private-key': ModalDecodePrivateKey },
    computed: mapGetters({
        privateKey: 'account/privateKey',
        profile: 'account/profile',
        user: 'account/user',
    }),
})
export default class Redirect extends Vue {
    busy = false;
    error = '';

    // getters
    user!: User;
    profile!: UserProfile;
    privateKey!: string;

    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirectCallback');
            await this.$store.dispatch('account/getPrivateKey');
            await this.$store.dispatch('account/getProfile');

            if (!this.profile.privateKey) {
                this.init();
                return;
            }

            this.$bvModal.show('modalDecodePrivateKey');
        } catch (e) {
            this.error = e.toString();
        }
    }

    async init() {
        this.$router.push('/');
    }
}
</script>
