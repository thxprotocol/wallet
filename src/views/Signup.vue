<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Signup extends Vue {
    error = '';

    async mounted() {
        try {
            await this.$store.dispatch('account/signupRedirect');
        } catch (e) {
            return;
        }
    }
}
</script>
