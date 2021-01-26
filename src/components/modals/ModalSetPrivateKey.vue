<template>
    <b-modal id="modalSetPrivateKey" @show="reset()" centered scrollable title="Set a private key">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>

            <template v-if="!password">
                <b-form-input size="lg" v-model="input.password" type="password" placeholder="Enter your password" />
            </template>

            <template v-else>
                <b-alert show variant="warning">
                    <strong>Create a secure backup of your private key elsewhere</strong>.
                </b-alert>
                <p>
                    This key is required to access your assets.
                    <strong>If you loose it, it can not be recovered.</strong> The wallet will only store your key on
                    this device.
                </p>
                <b-form-input size="lg" v-model="input.privateKey" placeholder="Enter a private key" />
            </template>
        </template>
        <template v-slot:modal-footer>
            <b-button v-if="!password" class="mt-3 btn-rounded" block variant="success" @click="set()">
                Save
            </b-button>
            <b-button v-if="password" class="mt-3 btn-rounded" block variant="success" @click="update()">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BModal, BFormInput } from 'bootstrap-vue';
import { User } from 'oidc-client';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    name: 'ModalSetPrivateKey',
    components: {
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
    }),
})
export default class ModalSetPrivateKey extends Vue {
    busy = false;
    error = '';
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

    async set() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');

            this.$store.commit('account/setPassword', this.input.password);
            this.input.privateKey = this.privateKey;
        } catch (e) {
            this.error = e;
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
