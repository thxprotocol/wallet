<template>
    <div id="app" class="d-flex flex-column h-100">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <header class="p-md-3 container-fluid d-flex align-items-center" v-if="$router.currentRoute.name">
                <b-button to="/" variant="link" class="pl-0 mr-auto mr-md-0">
                    <img :src="require('@/assets/img/logo.png')" height="32" alt="" />
                </b-button>
                <base-network-select v-if="profile" />
                <div class="d-none d-md-flex flex-grow-1 justify-content-center ">
                    <base-main-menu v-if="profile" class="mx-auto" />
                </div>
                <base-dropdown-account class="ml-2 ml-md-auto" />
            </header>
            <div
                class="container container-md d-flex flex-column flex-grow-1 flex-md-grow-0 mt-0 my-md-auto"
                style="max-width: 768px; min-height: 450px"
            >
                <h1 class="display-5 text-secondary">{{ $router.currentRoute.name }}</h1>
                <router-view class="main-container flex-grow-1 overflow-auto shadow-lg px-0 p-md-3" />
            </div>
            <footer class="d-flex align-items-center container" style="height: 85px" v-if="$router.currentRoute.name">
                <base-main-menu v-if="profile" class="w-100 d-md-none" />
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from './store/modules/account';
import BaseNetworkSelect from './components/BaseNetworkSelect.vue';
import BaseDropdownAccount from './components/BaseDropdownAccount.vue';
import BaseDropdownMenu from './components/BaseDropdownMenu.vue';
import BaseMainMenu from './components/BaseMainMenu.vue';

@Component({
    components: {
        BaseMainMenu,
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
