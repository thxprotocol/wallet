<template>
    <div id="app" class="d-flex flex-column h-100 ">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <b-jumbotron class="flex-grow-0" bg-variant="primary" text-variant="dark" v-if="$router.currentRoute.name">
                <div class="container">
                    <h1 class="display-5 m-0">{{ $router.currentRoute.name }}</h1>
                </div>
            </b-jumbotron>

            <router-view class="main-container flex-grow-1" />
        </div>
        <div class="flex-grow-0" v-if="profile && !profile.privateKey">
            <navbar />
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BJumbotron } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import Navbar from '@/components/Navbar.vue';

@Component({
    components: {
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'navbar': Navbar,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class App extends Vue {
    created() {
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
</script>
