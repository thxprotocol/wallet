<template>
    <b-modal
        id="modalSetPrivateKey"
        @show="reset()"
        @hidden="$emit('init')"
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        centered
        scrollable
        title="Decrypt stored private key"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>

            <form @submit.prevent="set()" id="formPassword" v-if="!password">
                <b-form-input
                    autofocus
                    size="lg"
                    v-model="input.password"
                    type="password"
                    placeholder="Enter your password"
                />
            </form>

            <form @submit.prevent="update()" id="formPrivateKey" v-if="password && profile">
                <b-alert show variant="warning">
                    <strong>Create a secure backup of your private key elsewhere</strong>.
                </b-alert>
                <p>
                    This key is required to access your assets.
                    <strong>If you loose it, it can not be recovered.</strong>
                </p>
                <base-input-private-key :value="input.privateKey" @validated="validPrivateKey = $event" />
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button v-if="!password" class=" btn-rounded" block variant="success" form="formPassword" type="submit">
                Save
            </b-button>
            <b-button
                v-if="profile"
                :disabled="!validPrivateKey"
                class="btn-rounded"
                block
                variant="success"
                type="submit"
                form="formPrivateKey"
            >
                Update
            </b-button>
            <b-button v-if="password" :disabled="!validPrivateKey" block variant="link" type="submit" @click="cancel()">
                Close
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import BaseInputPrivateKey from '@/components/InputPrivateKey.vue';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'ModalSetPrivateKey',
    components: {
        'base-input-private-key': BaseInputPrivateKey,
        'b-form-input': BFormInput,
        'b-alert': BAlert,
        'b-link': BLink,
        'b-modal': BModal,
        'b-spinner': BSpinner,
        'b-button': BButton,
    },
    computed: mapGetters({
        user: 'account/user',
        password: 'account/password',
        privateKey: 'account/privateKey',
        profile: 'account/profile',
    }),
})
export default class ModalSetPrivateKey extends Vue {
    busy = false;
    error = '';
    validPrivateKey = false;
    input = {
        password: '',
        privateKey: '',
    };

    // getters
    user!: User;
    password!: string;
    privateKey!: string;

    async reset() {
        this.input.password = this.password;
        this.input.privateKey = this.privateKey;
    }

    cancel() {
        this.$bvModal.hide('modalSetPrivateKey');
    }

    async set() {
        this.busy = true;

        try {
            const { privateKey, privateKeys } = await this.$store.dispatch('account/getProfile');

            this.$store.commit('account/setPassword', {
                pkey: privateKey,
                keys: privateKeys,
                pwd: this.input.password,
            });

            this.input.privateKey = this.privateKey;
            this.error = '';
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }

    async update() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/setPrivateKey', {
                pkey: this.input.privateKey,
                pwd: this.password,
            });
            this.$bvModal.hide('modalSetPrivateKey');
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
