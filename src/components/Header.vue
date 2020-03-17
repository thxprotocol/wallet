<template>
<header class="region region-header">
    <button @click="goToAccount()" class="link-settings" v-if="account">
        <div class="account-picture account-picture-sm bg-yellow">
            <img v-if="account.picture"
                :src="account.picture.url"
                :alt="account.picture.name"
                width="100%"
                height="100%"
                class="rounded-circle" />
            <span v-if="!account.picture && account.initials">
                {{ account.initials}}
            </span>
        </div>
    </button>

    <div class="account_balance">
        <p><span class="font-size-l">{{tokenBalance}} THX</span></p>
        <p><span>{{tokenRinkebyBalance}} THX</span> | <span>{{ethBalance}} ETH</span></p>
    </div>

</header>
</template>

<script src="./Header.ts" lang="ts" lang="ts"></script>