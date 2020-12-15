<template>
    <div class="container mt-3">
        <label for="accountAddress">Account address:</label>
        <b-input-group>
            <b-form-input id="accountAddress" readonly :value="account.address" />
            <b-input-group-append>
                <b-button variant="secondary" v-b-modal="'modalSetPrivateKey'">
                    Change
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <hr />
        <h2>Asset Pools</h2>
        <b-list-group>
            <b-list-group-item
                class="d-flex justify-content-between align-items-center"
                :key="key"
                v-for="(membership, key) of memberships"
            >
                <strong>{{ membership.title }}</strong>
                <b-badge variant="primary" pill>
                    {{ membership.token.balance.hex | fromBigNumber }} {{ membership.token.symbol }}
                </b-badge>
            </b-list-group-item>
            <b-list-group-item class="text-center" v-if="busy">
                <b-spinner variant="primary" />
            </b-list-group-item>
        </b-list-group>

        <hr />

        <b-button class="btn-rounded" block variant="link" @click="logout()">
            Logout
        </b-button>
        <modal-set-private-key />
    </div>
</template>

<script lang="ts">
import ModalSetPrivateKey from '@/components/modals/ModalSetPrivateKey.vue';
import {
    BBadge,
    BButton,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BListGroup,
    BListGroupItem,
    BSpinner,
} from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Account } from '../store/modules/account';

@Component({
    name: 'AccountView',
    components: {
        'modal-set-private-key': ModalSetPrivateKey,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-spinner': BSpinner,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        account: 'account/account',
        isAuthenticated: 'account/isAuthenticated',
        memberships: 'memberships/all',
    }),
})
export default class AccountView extends Vue {
    busy = false;
    account!: Account;

    async created() {
        this.busy = true;
        await this.$store.dispatch('memberships/init', this.account);
        this.busy = false;
    }

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
