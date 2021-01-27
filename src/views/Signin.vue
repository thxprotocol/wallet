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
            const token = this.$router.currentRoute.query.authentication_token;
            await this.$store.dispatch('account/signinRedirect', token);
        } catch (e) {
            return;
        }
    }
}
</script>
