<template>
    <div class="container mt-3">
        <h1>Logout</h1>
        <div class="text-center">
            <b-spinner variant="primary" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BSpinner } from 'bootstrap-vue';

@Component({
    components: {
        'b-spinner': BSpinner,
    },
})
export default class Logout extends Vue {
    async mounted() {
        await this.$store
            .dispatch('account/logout')
            .then(async () => {
                this.$router.push('/');
            })
            .catch(e => {
                console.log(e);
            });
    }
}
</script>
