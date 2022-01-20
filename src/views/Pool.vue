<template>
    <div class="h-100 w-100">
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && membership">
            <div class="container">
                <h1 class="display-4">
                    <strong class="font-weight-bold">
                        {{ membership.token.balance }}
                    </strong>
                    {{ membership.token.symbol }}
                </h1>
            </div>
            <div class="container mt-3">
                <b-alert show dismissable variant="danger" v-if="error">
                    {{ error }}
                </b-alert>
                <b-alert variant="info" show class="mb-3" v-if="!withdrawals[this.$route.params.id]">
                    You have no open withdrawals for this pool.
                </b-alert>
                <base-list-group-item-withdrawal
                    :withdrawal="withdrawal"
                    :membership="membership"
                    :key="key"
                    v-for="(withdrawal, key) of withdrawals[this.$route.params.id]"
                />
                <b-button block variant="secondary" to="/account">
                    Back
                </b-button>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import Web3 from 'web3';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BAlert, BBadge, BButton, BJumbotron, BListGroup, BListGroupItem, BSpinner } from 'bootstrap-vue';
import { UserProfile } from '@/store/modules/account';
import { IWithdrawals } from '@/store/modules/withdrawals';
import { NetworkProvider } from '@/utils/network';
import { IMemberships, Membership } from '@/store/modules/memberships';
import BaseListGroupItemWithdrawal from '@/components/BaseListGroupItemWithdrawal.vue';

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
        BaseListGroupItemWithdrawal,
    },
    computed: mapGetters({
        web3: 'network/web3',
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        memberships: 'memberships/all',
        withdrawals: 'withdrawals/all',
    }),
})
export default class PoolView extends Vue {
    busy = false;
    error = '';
    page = 1;
    membership: Membership | null = null;

    // getters
    memberships!: IMemberships;
    profile!: UserProfile;
    withdrawals!: IWithdrawals;
    privateKey!: string;
    web3!: Web3;

    @Prop() npid!: NetworkProvider;

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');
            await this.$store.dispatch('network/setNetwork', { npid: this.npid, privateKey: this.privateKey });

            this.membership = await this.$store.dispatch('memberships/get', this.$route.params.id);

            await this.$store.dispatch('withdrawals/filter', {
                profile: this.profile,
                membership: this.membership,
                page: this.page,
                limit: 20,
                state: 0,
            });
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
