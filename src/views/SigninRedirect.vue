<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
})
export default class Redirect extends Vue {
    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirectCallback');

            this.$router.push('/');
        } catch (e) {
            return;
        }
    }
}
</script>
