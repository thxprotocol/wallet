<template>
    <div class="container" v-if="profile">
        <b-list-group v-if="web3">
            <base-list-group-item-token :web3="web3" :address="token" :key="key" v-for="(token, key) in profile.erc20">
                {{ token }}
            </base-list-group-item-token>
        </b-list-group>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend, BListGroup } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import BaseListGroupItemToken from '@/components/BaseListGroupItemToken.vue';
import Web3 from 'web3';
import { NetworkProvider } from '@/utils/network';

@Component({
    components: {
        'b-alert': BAlert,
        'b-button': BButton,
        'b-list-group': BListGroup,
        'b-input-group': BInputGroup,
        'b-input-group-append': BInputGroupAppend,
        'b-form-input': BFormInput,
        'base-list-group-item-token': BaseListGroupItemToken,
    },
    computed: mapGetters({
        web3: 'network/web3',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
    }),
})
export default class Wallet extends Vue {
    busy = false;
    error = '';
    npid: NetworkProvider = NetworkProvider.Main;

    web3!: Web3;
    profile!: UserProfile;
    privateKey!: string;

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');

            this.$store.commit('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
