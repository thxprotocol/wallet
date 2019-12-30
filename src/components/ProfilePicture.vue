<template>
    <div v-if="profile" :class="`account-picture account-picture-${size} bg-yellow`">
        <img v-if="profile.picture"
            :src="profile.picture.url"
            :alt="profile.picture.name"
            width="100%"
            height="100%"
            class="rounded-circle" />
        <span v-if="!profile.picture && profile.initials">
            {{ profile.initials}}
        </span>
    </div>
</template>


<script src="./ProfilePicture.ts" lang="ts"></script>
