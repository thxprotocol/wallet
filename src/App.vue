<template>
    <div id="app" class="d-flex flex-column h-100 ">
        <div class="flex-grow-1 overflow-auto">
            <b-jumbotron bg-variant="primary" text-variant="white" v-if="$router.currentRoute.name">
                <div class="container">
                    <h1 class="display-4">{{ $router.currentRoute.name }}</h1>
                </div>
            </b-jumbotron>
            <router-view />
        </div>
        <div class="flex-grow-0">
            <navbar />
        </div>
        <modal-set-private-key />
    </div>
</template>

<script lang="ts">
import { BButton, BJumbotron } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import Navbar from '@/components/Navbar.vue';
import ModalSetPrivateKey from './components/modals/ModalSetPrivateKey.vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'modal-set-private-key': ModalSetPrivateKey,
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'navbar': Navbar,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class App extends Vue {
    privateKey!: string;

    get title() {
        return this.$router.currentRoute.name;
    }

    async mounted() {
        if (!this.privateKey) {
            this.$bvModal.show('modalSetPrivateKey');
        }
    }
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';
@import url('https://fonts.googleapis.com/css?family=Exo+2:200,400,400i,700,700i,900,900i');
@import url('https://fonts.googleapis.com/css?family=Ubuntu:200,400,400i,700,700i,900,900i');

$yellow: #fde542;
$blue: #039be5;

html,
body {
    height: 100%;
    font-family: 'Ubuntu';
}

h1,
h2,
h3 {
    font-family: 'Exo 2';
    font-size: 1.5rem;
}

.text-overflow {
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    overflow: hidden;
    width: 100%;
}

.text-overflow-200 {
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    overflow: hidden;
    width: 100px;
}

.bg-yellow {
    background-color: $yellow;
}

.overflow-auto {
    overflow: auto;
}

.center-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-rounded {
    border-radius: 25px;
}
</style>
