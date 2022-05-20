<template>
    <b-button-group size="md">
        <b-button to="/wallet" :variant="path === '/wallet' ? 'secondary' : 'darker'">
            Wallet
        </b-button>
        <b-button to="/memberships" :variant="path === '/memberships' ? 'secondary' : 'darker'">
            Pools
        </b-button>
    </b-button-group>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseMainMenu extends Vue {
    get path() {
        return this.$router.currentRoute.path;
    }
}
</script>
