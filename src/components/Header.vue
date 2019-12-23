<template>
<header class="region region-header">
    <button href="/account" class="link-settings">
        <ProfilePicture v-if="$account.profile.picture" size="sm" :profile="$account.profile" />
    </button>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.token}} THX</span></p>
        <p><span>{{balance.tokenRinkeby}} THX</span> | <span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script src="./Header.ts" lang="ts" lang="ts"></script>