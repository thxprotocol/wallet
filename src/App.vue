<template>
    <div id="app" class="container mt-3 mb-3">
        Ether: {{ ethBalance }}
        <br />
        Root: {{ rootBalance }}
        <br />
        Child: {{ childBalance }}
        <hr />
        <b-button block v-if="isAuthenticated" @click="logout()">Logout</b-button>
        <hr />
        <router-view />
    </div>
</template>

<script lang="ts">
import { BButton } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'b-button': BButton,
    },
    computed: {
        ...mapGetters('account', ['account', 'isAuthenticated']),
        ...mapGetters('balance', ['rootBalance', 'childBalance', 'ethBalance']),
    },
})
export default class Home extends Vue {
    account!: Account;
    isAuthenticated!: boolean;
    rootBalance!: string;
    childBalance!: string;
    ethBalance!: string;

    async created() {
        await this.$store.dispatch('balance/init');
    }

    async logout() {
        await this.$store.dispatch('account/logout');
        this.$router.push('/login');
    }
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';
@import url('https://fonts.googleapis.com/css?family=Exo+2:200,400,400i,700,700i,900,900i');

$yellow: #fde542;
$blue: #039be5;

h1,
h2,
h3 {
    font-family: 'Exo 2';
}
</style>
