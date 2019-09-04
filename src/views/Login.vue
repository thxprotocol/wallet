<template>
    <main class="d-flex h-100 w-100 text-white align-items-center justify-content-center" style="background: black;">

        <BSpinner v-if="loading" label="Loading..."></BSpinner>

        <form v-if="!loading" class="form" v-on:submit.prevent="login">
            <div class="form-group d-flex justify-content-center">
                <img width="75" height="75" src="../assets/thx_logo.svg" alt="THX Logo" /><br>
            </div>
            <div class="form-group text-center">
                <h2>Enter your credentials</h2>
            </div>
            <div class="form-group">
                <input required type="text" class="form-control" v-model="email" placeholder="E-mail">
            </div>
            <div class="form-group">
                <input required type="password" v-model="password" class="form-control" placeholder="******">
            </div>
            <div class="form-group">
                <button class="btn btn-primary btn-block btn-inverse" type="submit">Login</button>
            </div>
            <p>You don't have an account? You can <router-link to="/register">register one!</router-link>
            </p>
        </form>
    </main>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import { BSpinner } from 'bootstrap-vue';

export default {
    name: 'login',
    components: {
        BSpinner
    },
    data: function() {
        return {
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
