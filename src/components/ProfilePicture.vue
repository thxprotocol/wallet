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

<style lang="scss">
.region-header .account-picture {
    box-shadow: 0 0 0px 4px rgba(255,255,255,.3);
}

.account-picture {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #333;
    font-weight: bold;
    font-size: 1.5rem;

    &.account-picture-xs {
        width: 25px;
        height: 25px;
        max-width: 25px;
        max-height: 25px;
        font-size: 1rem;
    }

    &.account-picture-sm {
        width: 50px;
        height: 50px;
        max-width: 50px;
        max-height: 50px;
    }

    &.account-picture-lg {
        width: 100px;
        height: 100px;
        max-width: 100px;
        max-height: 100px;
        font-size: 2rem;
    }
}
</style>

<script src="./ProfilePicture.ts" lang="ts"></script>
