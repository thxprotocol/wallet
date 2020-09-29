<template>
    <div class="container mt-3">
        <h1>Login</h1>
        <p v-if="isAuthenticated">You are already logged in. <router-link to="/">Return home</router-link></p>
        <form v-on:submit.prevent="submit" v-if="!isAuthenticated">
            <label>E-mail:</label>
            <b-form-input type="email" v-model="email" />
            <label>Password:</label>
            <b-form-input type="password" v-model="password" />
            <b-button class="mt-2" variant="primary" type="submit">
                Submit
            </b-button>
        </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BLink, BButton, BFormInput } from 'bootstrap-vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
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
        await this.$store
            .dispatch('account/login', { email: this.email, password: this.password })
            .then(async () => {
                this.$router.push('/');
            })
            .catch(e => {
                console.log(e);
            });
    }
}
</script>
