<template>
    <article class="region region-container overflow p-3 d-block">
        <div class="pb-2 w-100" :key="key" v-for="(notification, key) in notifications">
            <component :is="notification.metadata.component" :notification="notification" />
        </div>
    </article>
</template>

<script src="./Notifications.ts" lang="ts"></script>
