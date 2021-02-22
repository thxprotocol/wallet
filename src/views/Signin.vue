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
            const key = this.$router.currentRoute.query.secure_key;

            await this.$store.dispatch('account/signinRedirect', { token, key });
        } catch (e) {
            return;
        }
    }
}
</script>
