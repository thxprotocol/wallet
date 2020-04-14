<template>
    <article class="region region-container overflow p-3 d-block">
        <div class="pb-2 w-100" v-for="(notification, key) in notifications">
            <notification-membership-request :notification="notification" />
        </div>
    </article>
</template>

<script src="./Notifications.ts" lang="ts"></script>
