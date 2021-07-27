<template>
    <div id="app" class="d-flex flex-column h-100">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <header class="pt-3 pb-3" v-if="$router.currentRoute.name">
                <div class="container">
                    <div class="row">
                        <div class="col-8">
                            <h1 class="display-5 m-0">{{ $router.currentRoute.name }}</h1>
                        </div>
                        <div class="col-4">
                            <base-network-select :npid="npid" @change="onChangeNetwork($event)" class="float-right" />
                        </div>
                    </div>
                </div>
            </header>
            <router-view :npid="npid" class="main-container flex-grow-1" />
        </div>
        <navbar class="flex-grow-0" v-if="profile && !profile.privateKey" />
    </div>
</template>

<script lang="ts">
import { BButton, BJumbotron } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import Navbar from '@/components/Navbar.vue';
import BaseNetworkSelect from './components/BaseNetworkSelect.vue';
import { NetworkProvider } from './utils/network';
import { UserProfile } from './store/modules/account';

@Component({
    components: {
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'navbar': Navbar,
        'base-network-select': BaseNetworkSelect,
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
