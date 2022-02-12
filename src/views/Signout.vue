<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
})
export default class Signout extends Vue {
    async mounted() {
        try {
            await this.$store.dispatch('account/signoutRedirect', {});
        } catch (e) {
            return;
        }
    }
}
</script>
