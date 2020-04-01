<template>
    <main class="d-flex h-100 w-100 text-white align-items-center justify-content-center" style="background: black;">
        <b-spinner v-if="loading" label="Loading..."></b-spinner>

        <form v-if="!loading" class="form" v-on:submit.prevent="login">
            <div class="form-group d-flex justify-content-center">
                <img width="75" height="75" src="../assets/thx_logo.svg" alt="THX Logo" /><br />
            </div>
            <div class="form-group text-center">
                <h2>Enter your credentials</h2>
            </div>
            <div class="alert alert-danger" v-if="error">
                {{ error }}
            </div>
            <div class="form-group">
                <input required type="text" class="form-control" v-model="email" placeholder="E-mail" />
            </div>
            <div class="form-group">
                <input required type="password" v-model="password" class="form-control" placeholder="******" />
            </div>
            <div class="form-group">
                <button class="btn btn-primary btn-block btn-inverse" type="submit">Login</button>
            </div>
            <p>You don't have an account? You can <router-link to="/register">register one!</router-link></p>
        </form>
    </main>
</template>

<script src="./Login.ts" lang="ts"></script>
