<template>
    <b-button-group size="md">
        <b-button to="/crypto" :variant="path === '/crypto' ? 'secondary' : 'darker'">
            Crypto
        </b-button>
        <b-button to="/nft" :variant="path === '/nft' ? 'secondary' : 'darker'">
            NFT
        </b-button>
        <b-button to="/memberships" :variant="path === '/memberships' ? 'secondary' : 'darker'">
            Memberships
        </b-button>
    </b-button-group>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';

@Component({})
export default class BaseMainMenu extends Vue {
    path = '';

    @Watch('$route', { immediate: true, deep: true })
    onUrlChange(newRoute: Route) {
        this.path = newRoute.path;
    }
}
</script>
