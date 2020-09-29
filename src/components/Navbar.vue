<template>
    <b-navbar type="dark" class="bg-dark">
        <b-navbar-nav justified class="w-100">
            <b-nav-item to="/">
                Scan
            </b-nav-item>
            <b-nav-item to="/wallet">
                Wallet
            </b-nav-item>
            <b-nav-item to="/account">
                Account
            </b-nav-item>
        </b-navbar-nav>
    </b-navbar>
</template>
<script lang="ts">
import { BNavbar, BNavbarNav, BNavItem } from 'bootstrap-vue';
import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'b-navbar': BNavbar,
        'b-nav-item': BNavItem,
        'b-navbar-nav': BNavbarNav,
    },
    computed: {
        ...mapGetters('account', ['account']),
    },
})
export default class Navbar extends Vue {}
</script>
