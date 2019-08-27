<template>
    <article class="region region--container">
        <header class="region region--header">
            <div class="logo">
                <img width="50" height="50" v-bind:src="assets.logo" alt="THX Logo" />
            </div>
            <p>A token of appreciation</p>
        </header>
        <main class="region region--content">
            <div class="loader" v-if="loading">Loading...</div>
            <form class="form" v-on:submit.prevent="login" v-if="!loading">
                <h1>Enter your details</h1>
                <div class="form-item">
                    <input required type="text" class="form-control" v-model="email" placeholder="E-mail">
                </div>
                <div class="form-item">
                    <input required type="password" v-model="password" placeholder="******">
                </div>
                <button class="btn btn-primary" type="submit">Login</button>
                <p>You don't have an account? You can <router-link to="/register">register one!</router-link>
                </p>
            </form>
        </main>
    </article>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import Logo from '../assets/thx_logo.svg'

export default {
    name: 'login',
    data: function() {
        return {
            assets: {
                logo: Logo
            },
            email: '',
            password: '',
            loading: false
        }
    },
    methods: {
        login: function() {
            this.loading = true;
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(() => {
                    this.loading = false;
                    this.$router.replace('/')
                })
                .catch((err) => {
                    if (typeof err != 'undefined') {
                        // eslint-disable-next-line
                        console.error(err.code + ' ' + err.message);
                        alert('Error during authentication');
                    }
                });
        }
    }
}
</script>

<style scoped>
    .region--content {
        background-color: transparent;
    }
</style>
