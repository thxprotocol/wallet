<template>
    <div id="app" class="d-flex flex-column h-100">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <header class="pt-3 pb-3 container-fluid d-flex align-items-center" v-if="$router.currentRoute.name">
                <b-button to="/" variant="link" class="pl-0 mr-auto mr-md-0">
                    <img :src="require('@/assets/img/logo.png')" height="32" alt="" />
                </b-button>
                <base-network-select />
                <div class="d-none d-md-flex flex-grow-1 justify-content-center" v-if="profile">
                    <b-button-group size="md" class="mx-auto">
                        <b-button
                            to="/wallet"
                            :variant="$router.currentRoute.path === '/wallet' ? 'secondary' : 'darker'"
                            >Wallet</b-button
                        >
                        <b-button
                            to="/memberships"
                            :variant="$router.currentRoute.path === '/memberships' ? 'secondary' : 'darker'"
                        >
                            Pools
                        </b-button>
                    </b-button-group>
                </div>
                <base-dropdown-account class="ml-2 ml-md-auto" />
                <base-dropdown-menu class="ml-2" />
            </header>
            <div class="container-fluid">
                <router-view class="main-container flex-grow-1 overflow-auto shadow-lg" />
            </div>
            <footer class="container-fluid" style="height: 85px" v-if="$router.currentRoute.name"></footer>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseNetworkSelect from './components/BaseNetworkSelect.vue';
import BaseDropdownAccount from './components/BaseDropdownAccount.vue';
import BaseDropdownMenu from './components/BaseDropdownMenu.vue';
import { mapGetters } from 'vuex';
import { UserProfile } from './store/modules/account';

@Component({
    components: {
        BaseNetworkSelect,
        BaseDropdownAccount,
        BaseDropdownMenu,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class App extends Vue {
    profile!: UserProfile | null;

    created() {
        if (process.env.VUE_APP_GTM) {
            (function(w: any, d, s, l: any, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime(),
                    'event': 'gtm.js',
                });
                const f: any = d.getElementsByTagName(s)[0],
                    j: any = d.createElement(s),
                    dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', process.env.VUE_APP_GTM);
        }
    }
}
</script>
