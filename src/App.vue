<template>
    <div id="app" class="d-flex flex-column h-100">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <header class="pt-3 pb-3 container-fluid d-flex align-items-center" v-if="$router.currentRoute.name">
                <b-button to="/" variant="link" class="pl-0 mr-auto mr-md-0">
                    <img :src="require('@/assets/img/logo.png')" height="32" alt="" />
                </b-button>
                <base-network-select :npid="npid" @change="onChangeNetwork($event)" />
                <base-dropdown-account class="ml-md-auto" />
            </header>
            <div
                class="my-auto container d-flex flex-column"
                style="height: 100%; max-height: 400px; max-width: 769px;"
            >
                <h1 class="display-5 text-secondary">{{ $router.currentRoute.name }}</h1>
                <router-view class="main-container flex-grow-1 overflow-auto shadow-lg" :npid="npid" />
            </div>
            <footer class="container-fluid" style="height: 85px" v-if="$router.currentRoute.name"></footer>
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BDropdown, BDropdownDivider, BDropdownItem } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseNetworkSelect from './components/BaseNetworkSelect.vue';
import { NetworkProvider } from './utils/network';
import { UserProfile } from './store/modules/account';
import BaseDropdownAccount from './components/BaseDropdownAccount.vue';

@Component({
    components: {
        BButton,
        BaseNetworkSelect,
        BaseDropdownAccount,
        BDropdown,
        BDropdownItem,
        BDropdownDivider,
    },
    computed: mapGetters({
        privateKey: 'account/privateKey',
        profile: 'account/profile',
    }),
})
export default class App extends Vue {
    npid: NetworkProvider = NetworkProvider.Main;

    // getters
    profile!: UserProfile;
    privateKey!: string;

    async onChangeNetwork(npid: NetworkProvider) {
        this.npid = npid;
        await this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
    }

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
