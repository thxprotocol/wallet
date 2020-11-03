<template>
    <div class="container mt-3">
        <h1>Hi {{ account.firstName }}!</h1>
        <hr />
        <h2>Account address</h2>
        <b-list-group>
            <b-list-group-item>
                <small>{{ account.address }}</small>
            </b-list-group-item>
        </b-list-group>
        <hr />
        <h2>Asset Pools</h2>
        <b-list-group>
            <b-list-group-item :key="key" v-for="(assetPool, key) of account.assetPools">
                <small>{{ assetPool }}</small>
            </b-list-group-item>
        </b-list-group>
        <hr />
        <b-button block variant="link" v-b-modal="'modalSetPrivateKey'">
            Update Private Key
        </b-button>
        <b-button block variant="link" @click="logout()">
            Logout
        </b-button>
        <modal-set-private-key />
    </div>
</template>

<script lang="ts">
import ModalSetPrivateKey from '@/components/modals/ModalSetPrivateKey.vue';
import { BButton, BListGroup, BListGroupItem } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        'modal-set-private-key': ModalSetPrivateKey,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: {
        ...mapGetters('account', ['account', 'isAuthenticated']),
    },
})
export default class Account extends Vue {
    logout() {
        this.$store
            .dispatch('account/logout')
            .then(() => {
                this.$router.push('/login');
            })
            .catch(e => {
                console.log(e);
            });
    }
}
</script>
