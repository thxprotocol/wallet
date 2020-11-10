<template>
    <div class="center-center h-100">
        <p v-if="isAuthenticated">You are already logged in. <router-link to="/">Return home</router-link></p>
        <b-card bg-variant="light" v-if="!isAuthenticated">
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
                    <div class="form-group">
                        <label>Private Key:</label>
                        <b-input-group>
                            <b-form-input v-model="privateKey" />
                            <b-input-group-append>
                                <b-button @click="generateRandomPrivateKey()">Generate</b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </div>
                    <hr />
                    <b-alert v-if="privateKey" variant="warning" show>
                        <strong>Create a secure backup of your private key elsewhere</strong>.
                    </b-alert>

                    <b-form-checkbox id="checkbox-backupStatus" v-model="backupStatus" name="checkbox-backupStatus">
                        I have made a secure backup of my private key.
                    </b-form-checkbox>

                    <b-button
                        :disabled="!backupStatus || !privateKey"
                        block
                        class="mt-3 btn-rounded"
                        variant="primary"
                        type="submit"
                    >
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
import { ethers } from 'ethers';

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
    computed: {
        ...mapGetters('account', ['isAuthenticated']),
    },
})
export default class Register extends Vue {
    backupStatus = false;
    isAuthenticated!: boolean;
    firstName = '';
    lastName = '';
    email = '';
    privateKey = '';
    password = '';
    confirmPassword = '';

    generateRandomPrivateKey() {
        const wallet = ethers.Wallet.createRandom();
        this.privateKey = wallet.privateKey;
    }

    async submit() {
        const address = (await this.getAddressForPrivateKey(this.privateKey)) || '';

        if (ethers.utils.isAddress(address)) {
            try {
                await this.$store.dispatch('account/signup', {
                    address,
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

    async getAddressForPrivateKey(privateKey: string) {
        try {
            const account = new ethers.Wallet(privateKey);

            localStorage.setItem('thx:wallet:privatekey', this.privateKey);

            return await account.getAddress();
        } catch (e) {
            console.error(e.toString());
            this.$bvToast.toast('Your private key is not valid', { title: 'Error: ', variant: 'danger' });
        }
    }
}
</script>
