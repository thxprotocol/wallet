<template>
    <div id="app" class="container mt-3 mb-3">
        <div class="row" v-if="isAuthenticated">
            <div class="col-md-12">
                <div v-if="account">
                    Account address:<br />
                    <code>{{ account.address }}</code>
                </div>
                <h2 class="h2">Root Network</h2>
                ETH: {{ rootETH | fromWei }}
                <br />
                ERC20: {{ rootERC20 }}
            </div>
            <div class="col-md-12">
                <h2 class="h2">Child Network</h2>
                ERC20: {{ childERC20 }}
                <br />
                MATIC: {{ childMATIC | fromWei }}
            </div>
        </div>
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
        ...mapGetters('balance', ['rootETH', 'childETH', 'rootMATIC', 'childMATIC', 'rootERC20', 'childERC20']),
    },
})
export default class Home extends Vue {
    account!: Account;
    isAuthenticated!: boolean;
    rootBalance!: string;
    childBalance!: string;
    ethBalance!: string;

    async created() {
        await this.$store.dispatch('balance/init').catch(() => {
            this.$store.commit('account/authenticate', false);
        });
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

.text-overflow {
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    overflow: hidden;
    width: 100%;
}
</style>
