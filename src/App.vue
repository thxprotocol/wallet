<template>
<div id="app" v-bind:class="`section--${$router.currentRoute.name}`">
    <Header v-if="$router.currentRoute.meta.header" ref="header" />
    <router-view />
    <Footer ref="footer" />
</div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

import ContractService from './services/ContractService';

/*global THX*/
window.THX = {};
THX.contracts = new ContractService();

export default {
    name: 'App',
    components: {
        Header,
        Footer
    }
}
</script>

<style lang="scss">
@import './app.scss';
</style>
