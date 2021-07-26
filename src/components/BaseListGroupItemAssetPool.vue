<template>
    <b-list-group-item
        v-if="assetPool"
        class="d-flex justify-content-between align-items-center"
        :class="{ disabled: !assetPool.poolToken }"
    >
        <div class="mr-auto" v-if="assetPool.title">
            <strong>{{ assetPool.title }}</strong
            ><br />
            <small class="text-muted">{{ address }}</small>
        </div>

        <div class="text-muted mr-auto" v-else>
            {{ address }}
        </div>

        <div class="h3 mr-3 m-0" v-if="assetPool.poolToken">
            {{ assetPool.poolToken.balance }} {{ assetPool.poolToken.symbol }}
        </div>
        <b-button variant="primary" v-on:click.prevent="onClick()">Deposit</b-button>
        <base-modal-deposit-pool :assetPool="assetPool" :web3="web3" />
    </b-list-group-item>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IAssetPools } from '@/store/modules/assetPools';
import BaseModalDepositPool from '@/components/modals/ModalDepositPool.vue';
import Web3 from 'web3';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
        'base-modal-deposit-pool': BaseModalDepositPool,
    },
    computed: mapGetters({
        profile: 'account/profile',
        assetPools: 'assetpools/all',
        web3: 'network/web3',
    }),
})
export default class BaseListGroupItemAssetPool extends Vue {
    busy = true;

    // getters
    profile!: UserProfile;
    assetPools!: IAssetPools;
    web3!: Web3;

    @Prop() address!: string;

    get assetPool() {
        return this.assetPools[this.address];
    }

    onClick() {
        this.$bvModal.show(`modalDepositPool-${this.address}`);
    }
}
</script>
