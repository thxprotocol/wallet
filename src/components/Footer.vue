<template>
    <footer class="region region-navigation">
        <b-nav fill>
            <b-nav-item v-bind:key="route.name" v-for="route in routes" v-bind:to="route.path">
                <span class="badge badge-danger" v-if="route.name === 'notifications' && notificationCount">
                    {{ notificationCount }}
                </span>
                <img width="20" height="20" v-bind:src="assets[route.name]" alt="Icon" />
            </b-nav-item>
        </b-nav>
    </footer>
</template>

<script src="./Footer.ts" lang="ts"></script>
