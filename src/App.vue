<template>
    <div id="app" class="d-flex flex-column h-100 ">
        <div class="flex-grow-1 overflow-auto">
            <router-view />
        </div>
        <div class="flex-grow-0" v-if="isAuthenticated">
            <navbar />
        </div>
    </div>
</template>

<script lang="ts">
import { BButton } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import Navbar from '@/components/Navbar.vue';
import crypto from 'crypto';

@Component({
    components: {
        'b-button': BButton,
        'navbar': Navbar,
    },
    computed: {
        ...mapGetters('account', ['account', 'isAuthenticated']),
        ...mapGetters('balance', ['rootETH', 'childETH', 'rootMATIC', 'childMATIC', 'rootERC20', 'childERC20']),
    },
})
export default class Home extends Vue {
    account!: Account;

    async created() {
        await this.$store.dispatch('balance/init').catch(() => {
            this.$store.commit('account/authenticate', false);
        });
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

.btn {
    border-radius: 25px;
}
</style>
