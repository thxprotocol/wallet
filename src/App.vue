<template>
    <div id="app" class="d-flex flex-column h-100 ">
        <div class="flex-grow-1 overflow-auto">
            <b-jumbotron bg-variant="primary" text-variant="dark" v-if="$router.currentRoute.name">
                <div class="container">
                    <h1 class="display-4">{{ $router.currentRoute.name }}</h1>
                </div>
            </b-jumbotron>

            <router-view />
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
export default class App extends Vue {}
</script>
