<template>
    <article class="region region-container">
        <header class="region region-header" style="background: black;">
            <p class="logo">
                <img width="50" height="50" src="../assets/thx_logo.svg" alt="THX Logo" />
            </p>
            <p style="color: white;">A token of appreciation</p>
        </header>

        <div class="region region-container">
            <main class="region region-content">

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
        </div>
    </article>
</template>

<script src="./Register.ts" lang="ts"></script>
