<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
})
export default class Renew extends Vue {
    async mounted() {
        try {
            await this.$store.dispatch('account/signinSilent');
        } catch (e) {
            return;
        }
    }
}
</script>
