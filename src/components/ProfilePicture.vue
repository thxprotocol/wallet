<template>
    <div :class="`flex-shrink-0 account-picture account-picture-${size} bg-yellow`">
        <img v-if="picture"
            :src="picture.url"
            :alt="picture.name"
            width="100%"
            height="100%"
            class="rounded-circle" />
        <span v-else>
            {{ initials}}
        </span>
        <span class="status" :class="online ? 'status-online' : 'status-offline'"></span>
    </div>
</template>

<script src="./ProfilePicture.ts" lang="ts"></script>
