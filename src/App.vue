<template>
    <div id="app" :class="`section-${$router.currentRoute.name}`">
        <Header v-if="$router.currentRoute.meta.header" ref="header" />
        <router-view />
        <Footer v-if="$router.currentRoute.meta.footer" ref="footer" />
    </div>
</template>
<script src="./App.ts" lang="ts"></script>