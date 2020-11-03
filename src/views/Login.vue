<template>
    <div class="center-center h-100">
        <p v-if="isAuthenticated">You are already logged in. <router-link to="/">Return home</router-link></p>
        <b-card bg-variant="light" v-if="!isAuthenticated">
            <b-card-body>
                <form v-on:submit.prevent="submit">
                    <label>E-mail:</label>
                    <b-form-input type="email" v-model="email" />
                    <label>Password:</label>
                    <b-form-input type="password" v-model="password" />
                    <b-button block class="mt-3" variant="primary" type="submit">
                        Submit
                    </b-button>
                </form>
            </b-card-body>
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BLink, BButton, BFormInput, BCardBody, BCard } from 'bootstrap-vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'b-card': BCard,
        'b-card-body': BCardBody,
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
