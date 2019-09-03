<template>
    <article class="region region--container">
        <header class="region region--header" style="background: black;">
            <p class="logo">
                <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
            </p>
            <p style="color: white;">A token of appreciation</p>
        </header>
        <main class="region region--content">

            <div class="text-center" v-if="loading">
                <BSpinner label="Loading..."></BSpinner>
            </div>

            <form class="form" v-on:submit.prevent="register" v-if="!loading">
                <h2>Authentication</h2>
                <div class="form-group">
                    <input required type="text" class="form-control" v-model="firstName" placeholder="e.g. Ada">
                </div>
                <div class="form-group">
                    <input required type="text" class="form-control" v-model="lastName" placeholder="e.g. Lovelace">
                </div>
                <div class="form-group">
                    <input required type="email" class="form-control" v-model="email" placeholder="e.g. alovelace@abc.xyz">
                </div>
                <div class="form-group">
                    <input required type="password" v-model="password" class="form-control" placeholder="********">
                </div>
                <div class="form-group">
                    <input required type="password" v-model="passwordVerify" class="form-control" placeholder="********">
                </div>
                <div class="form-group">
                    <button class="btn btn-primary" type="submit">Create account</button>
                </div>
                <p>Or go back to <router-link to="/login">Login</router-link></p>
            </form>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import Logo from '../assets/thx_logo.svg'
import { BSpinner } from 'bootstrap-vue';

export default {
    name: 'register',
    components: {
        BSpinner,
    },
    data: function() {
        return {
            assets: {
                logo: Logo
            },
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordVerify: '',
            loading: false,
        }
    },
    methods: {
        register: function() {
            this.loading = true;

            if (this.password === this.passwordVerify) {
                this.createAccount();
            }
            else {
                alert("Your passwords do not match.");
            }
        },
        createAccount() {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                .then((r) => {
                    const user = {
                        uid: r.user.uid,
                        email: r.user.email,
                        firstName: r.user.firstName,
                        lastName: r.user.lastName,
                        userName: r.user.userName,
                    }

                    firebase.database().ref('users').child(user.uid).set(user);
                    this.loading = false;
                    this.$router.replace('/');
                })
                .catch((err) => {
                    if (typeof err != 'undefined') {
                        alert("Error during account registration.")
                    }
                    this.loading = false;
                })
        }
    }
}
</script>

<style scoped>
    .region--content {
        background-color: transparent;
    }
</style>
