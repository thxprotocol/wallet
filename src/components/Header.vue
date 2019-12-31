<template>
<header class="region region-header">

    <button @click="goToAccount()" class="link-settings" v-if="$account && $account.profile">
        <div class="account-picture account-picture-sm bg-yellow">
            <img v-if="$account.profile.picture"
                :src="$account.profile.picture.url"
                :alt="$account.profile.picture.name"
                width="100%"
                height="100%"
                class="rounded-circle" />
            <span v-if="!$account.profile.picture && $account.profile.initials">
                {{ $account.profile.initials}}
            </span>
        </div>
    </button>

    <div class="account_balance">
        <p><span class="font-size-large">{{tokenBalance}} THX</span></p>
        <p><span>{{tokenRinkebyBalance}} THX</span> | <span>{{ethRinkebyBalance}} ETH</span></p>
    </div>

</header>
</template>

<script src="./Header.ts" lang="ts" lang="ts"></script>