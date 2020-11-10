<template>
    <div class="center-center h-100">
        <p v-if="isAuthenticated">You are already logged in. <router-link to="/">Return home</router-link></p>
        <b-card bg-variant="light" footer-tag="footer" v-if="!isAuthenticated">
            <h2 class="font-weight-bold mb-3">THX Login</h2>
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
                <b-button size="sm" variant="link" href="register">
                    Forgot password?
                </b-button>
                <b-button size="sm" variant="link" href="register">
                    Register
                </b-button>
            </template>
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BLink, BButton, BFormInput, BCardBody, BCard, BCardFooter, BFormGroup } from 'bootstrap-vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'b-card': BCard,
        'b-form-group': BFormGroup,
        'b-card-body': BCardBody,
        'b-card-footer': BCardFooter,
        'b-button': BButton,
        'b-form-input': BFormInput,
        'b-link': BLink,
    },
    computed: {
        ...mapGetters('account', ['isAuthenticated']),
    },
})
export default class Login extends Vue {
    email = '';
    password = '';
    isAuthenticated!: boolean;

    async submit() {
        try {
            await this.$store.dispatch('account/login', { email: this.email, password: this.password });
            await this.$store.dispatch('account/init', this.password);
            this.$router.push('/');
        } catch (e) {
            console.log(e);
            this.$bvToast.toast(e, { title: 'Error: ', variant: 'danger' });
        }
    }
}
</script>
