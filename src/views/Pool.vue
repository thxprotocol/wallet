<template>
    <div class="h-100 w-100">
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && membership">
            <div class="container">
                <h1 class="display-4">
                    <strong class="font-weight-bold">
                        {{ membership.poolToken.balance }}
                    </strong>
                    {{ membership.poolToken.symbol }}
                </h1>
            </div>
            <div class="container mt-3">
                <b-alert show dismissable variant="danger" v-if="error">
                    {{ error }}
                </b-alert>
                <b-list-group class="mb-3" v-if="withdrawals">
                    <b-list-group-item
                        class="d-flex align-items-center w-100"
                        :class="{ 'border-success': withdrawal.approved && !withdrawal.state }"
                        :key="key"
                        v-for="(withdrawal, key) of withdrawals[this.$route.params.address]"
                    >
                        <strong class="font-weight-bold mr-auto">
                            {{ withdrawal.amount }}
                            {{ membership.poolToken.symbol }}
                        </strong>
                        <b-button variant="primary" :disabled="withdrawal.state === 1" @click="withdraw(withdrawal)">
                            Withdraw
                        </b-button>
                    </b-list-group-item>
                </b-list-group>
                <b-alert variant="info" show class="mb-3" v-else>
                    You have no open withdrawals for this pool.
                </b-alert>
                <b-button block variant="secondary" to="/account">
                    Back
                </b-button>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BAlert, BBadge, BButton, BJumbotron, BListGroup, BListGroupItem, BSpinner } from 'bootstrap-vue';
import { IAssetPools } from '@/store/modules/assetPools';
import { UserProfile } from '@/store/modules/account';
import { Membership } from '@/store/modules/membership';
import { IWithdrawals } from '@/store/modules/withdrawals';
import { NetworkProvider } from '@/utils/network';
import Web3 from 'web3';

@Component({
    name: 'PoolView',
    components: {
        'b-jumbotron': BJumbotron,
        'b-alert': BAlert,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-spinner': BSpinner,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        web3: 'network/web3',
        assetPools: 'assetpools/all',
        withdrawals: 'withdrawals/all',
    }),
})
export default class PoolView extends Vue {
    busy = false;
    error = '';
    page = 1;
    // getters
    assetPools!: IAssetPools;
    profile!: UserProfile;
    memberships!: Membership;
    withdrawals!: IWithdrawals;
    privateKey!: string;
    web3!: Web3;

    @Prop() npid!: NetworkProvider;

    get assetPool() {
        return this.assetPools[this.$route.params.address];
    }

    get membership() {
        return this.assetPools[this.$route.params.address];
    }

    async getWithdrawals() {
        await this.$store.dispatch('withdrawals/init', {
            profile: this.profile,
            poolAddress: this.$route.params.address,
            page: this.page,
            limit: 20,
            state: 0, // pending state
        });

        for (const id in this.withdrawals[this.$route.params.address]) {
            this.withdrawals[this.$route.params.address][id];
        }
    }

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });
            if (!this.profile) {
                await this.$store.dispatch('account/getProfile');
            }
            if (!this.assetPool) {
                await this.$store.dispatch('assetpools/get', {
                    web3: this.web3,
                    address: this.$route.params.address,
                });
            }
            await this.getWithdrawals();
            console.log(this.assetPools[this.$route.params.address]);
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
