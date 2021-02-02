<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {},
    computed: mapGetters({
        privateKey: 'account/privateKey',
    }),
})
export default class Redirect extends Vue {
    privateKey!: string;

    async mounted() {
        try {
            await this.$store.dispatch('account/signinRedirectCallback');
            await this.$store.dispatch('account/getPrivateKey');

            if (this.privateKey) {
                this.$router.push('/');
            }
        } catch (e) {
            console.error(e);
            return;
        }
    }
}
</script>
