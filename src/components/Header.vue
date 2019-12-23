<template>
<header class="region region-header">
    <button v-on:click="goToAccount()" class="link-settings">
        <ProfilePicture size="sm" :uid="uid"></ProfilePicture>
    </button>
    <div class="account_balance">
        <p><span class="font-size-large">{{balance.token}} THX</span></p>
        <p><span>{{balance.tokenRinkeby}} THX</span> | <span>{{balance.eth}} ETH</span></p>
    </div>
</header>
</template>

<script src="./Header.ts" lang="ts"></script>