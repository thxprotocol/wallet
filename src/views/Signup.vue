<template>
    <div class="center-center h-100">
        <b-card bg-variant="light">
            <b-card-body>
                <form v-on:submit.prevent="submit">
                    <div class="form-group row">
                        <div class="col-md-6">
                            <label>First name:</label>
                            <b-form-input v-model="firstName" />
                        </div>
                        <div class="col-md-6">
                            <label>Last name:</label>
                            <b-form-input v-model="lastName" />
                        </div>
                    </div>
                    <hr />
                    <div class="form-group">
                        <label>E-mail:</label>
                        <b-form-input type="email" v-model="email" />
                    </div>
                    <div class="form-group">
                        <label>Password:</label>
                        <b-form-input type="password" v-model="password" />
                    </div>
                    <div class="form-group">
                        <label>Password (confirm):</label>
                        <b-form-input type="password" v-model="confirmPassword" />
                    </div>
                    <hr />
                    <b-button block class="mt-3 btn-rounded" variant="primary" type="submit">
                        Submit
                    </b-button>
                </form>
            </b-card-body>
        </b-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
    BLink,
    BButton,
    BFormInput,
    BCardBody,
    BCard,
    BInputGroupAppend,
    BInputGroup,
    BAlert,
    BFormCheckbox,
} from 'bootstrap-vue';
import { mapGetters } from 'vuex';
import { User } from 'oidc-client';

@Component({
    components: {
        'b-alert': BAlert,
        'b-card': BCard,
        'b-card-body': BCardBody,
        'b-button': BButton,
        'b-form-input': BFormInput,
        'b-link': BLink,
        'b-form-checkbox': BFormCheckbox,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
    },
    computed: mapGetters({
        user: 'account/user',
    }),
})
export default class Register extends Vue {
    backupStatus = false;
    firstName = '';
    lastName = '';
    email = '';
    password = '';
    confirmPassword = '';

    // getters
    user!: User;

    mounted() {
        if (this.user) {
            this.$router.push('/account');
        }
    }

    async submit() {
        try {
            await this.$store.dispatch('account/signup', {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                password: this.password,
                confirmPassword: this.confirmPassword,
            });
            this.$router.push('/');
        } catch (e) {
            console.error(e.toString());
            this.$bvToast.toast('There was a problem with the request.', { title: 'Error: ', variant: 'danger' });
        }
    }
}
</script>
