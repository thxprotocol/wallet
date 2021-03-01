<template>
    <b-navbar type="white" class="bg-light">
        <b-navbar-nav justified class="w-100">
            <b-nav-item to="/wallet" disabled>
                <i class="fas fa-coins text-dark"></i>
            </b-nav-item>
            <b-nav-item to="/">
                <i class="fas fa-qrcode text-dark"></i>
            </b-nav-item>
            <b-nav-item to="/account">
                <i class="fas fa-user-circle text-dark"></i>
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
    computed: mapGetters({
        account: 'account/account',
    }),
})
export default class Navbar extends Vue {}
</script>
