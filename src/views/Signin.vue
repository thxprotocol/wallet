<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
})
export default class Login extends Vue {
    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirect');
        } catch (e) {
            return;
        }
    }
}
</script>
