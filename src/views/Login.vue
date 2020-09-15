<template>
    <div class="login">
        <h1>Login</h1>
        <form v-on:submit.prevent="submit">
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
import { BButton, BFormInput } from 'bootstrap-vue';

@Component({
    components: {
        'b-button': BButton,
        'b-form-input': BFormInput,
    },
})
export default class Login extends Vue {
    email = '';
    password = '';

    async submit() {
        await this.$store
            .dispatch('account/login', { email: this.email, password: this.password })
            .then(async () => {
                this.$router.push('/');
            })
            .catch(e => {
                console.log(e);
                debugger;
            });
    }
}
</script>
