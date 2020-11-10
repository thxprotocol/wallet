<template>
    <div class="center-center h-100">
        <p v-if="isAuthenticated">You are already logged in. <router-link to="/">Return home</router-link></p>
        <b-card bg-variant="light" footer-tag="footer" v-if="!isAuthenticated">
            <h2 class="font-weight-bold mb-3">Login</h2>
            <form v-on:submit.prevent="submit">
                <b-form-group>
                    <b-form-input type="email" placeholder="Enter e-mail" v-model="email" />
                </b-form-group>
                <b-form-group>
                    <b-form-input type="password" placeholder="Enter password" v-model="password" />
                </b-form-group>
                <b-button block class="mt-3 btn-rounded" variant="primary" type="submit">
                    Submit
                </b-button>
            </form>
            <template #footer>
                <!-- <b-button size="sm" variant="link" to="register">
                    Forgot password?
                </b-button> -->
                <b-button size="sm" variant="link" to="register">
                    Register account
                </b-button>
            </template>
        </b-card>
        <modal-set-private-key />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BLink, BButton, BFormInput, BCardBody, BCard, BCardFooter, BFormGroup } from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import { Account } from '@/store/modules/account';
import { account } from '@/utils/network';
import ModalSetPrivateKey from '@/components/modals/ModalSetPrivateKey.vue';

@Component({
    components: {
        'b-card': BCard,
        'b-form-group': BFormGroup,
        'b-card-body': BCardBody,
        'b-card-footer': BCardFooter,
        'b-button': BButton,
        'b-form-input': BFormInput,
        'b-link': BLink,
        'modal-set-private-key': ModalSetPrivateKey,
    },
    computed: {
        ...mapGetters('account', ['isAuthenticated', 'account']),
    },
})
export default class Login extends Vue {
    account!: Account;
    email = '';
    password = '';
    isAuthenticated!: boolean;

    async submit() {
        try {
            await this.$store.dispatch('account/login', { email: this.email, password: this.password });
            await this.$store.dispatch('account/init', this.password);

            if (this.account.address !== account.address) {
                this.$bvModal.show('modalSetPrivateKey');
            } else {
                this.$router.push('/');
            }
            // Check if the address in API db is equal to the local address for this private key
            // Show dialog if not the case.
            // Only continue if the user agrees with an update of the address in the api db
        } catch (e) {
            console.error(e.toString());
            this.$bvToast.toast('There was an issue during your login request.', {
                title: 'Error: ',
                variant: 'danger',
            });
        }
    }
}
</script>
