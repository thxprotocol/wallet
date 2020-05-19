<template>
    <header class="region region-header w-100">
        <button @click="goToAccount()" class="link-settings" v-if="account">
            <div class="account-picture account-picture-sm bg-yellow">
                <img
                    v-if="account.picture"
                    :src="account.picture.url"
                    :alt="account.picture.name"
                    width="100%"
                    height="100%"
                    class="rounded-circle"
                />
                <span v-if="!account.picture && account.initials">
                    {{ account.initials }}
                </span>
                <span class="status" :class="account.online ? 'status-online' : 'status-offline'"></span>
            </div>
        </button>

        <div class="account_balance">
            <p>
                <span class="font-size-l">{{ token }} THX</span>
            </p>
            <p>
                <span>{{ tokenRinkeby }} THX</span> | <span>{{ eth }} ETH</span>
            </p>
        </div>
        <div class="w-100 alert alert-warning mb-0" v-if="!$state.rinkebyPrivateKey || !$state.extdevPrivateKey">
            <strong>Can not establish a network connection.</strong> <br />
            <span>
                Go to <a class="text-primary" @click="$router.push('account')">your account</a> and provide your network
                keys.
            </span>
        </div>
    </header>
</template>

<script src="./Header.ts" lang="ts" lang="ts"></script>
