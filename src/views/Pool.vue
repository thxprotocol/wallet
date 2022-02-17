<template>
    <div>
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <div class="container pt-3 h-100 d-flex flex-column" v-if="!busy && membership">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert variant="info" show class="mb-3" v-if="!filteredWithdrawals.length">
                You have no scheduled or pending withdrawals for this pool.
            </b-alert>
            <div class="mb-auto">
                <base-list-group-item-withdrawal
                    :withdrawal="withdrawal"
                    :membership="membership"
                    :key="key"
                    v-for="(withdrawal, key) of filteredWithdrawals"
                />
            </div>
            <b-pagination
                v-if="total > perPage"
                @change="onChange"
                v-model="currentPage"
                :per-page="perPage"
                :total-rows="total"
                align="fill"
            ></b-pagination>
            <b-button block variant="dark" to="/account">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import Web3 from 'web3';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BAlert, BBadge, BButton, BJumbotron, BListGroup, BListGroupItem, BPagination, BSpinner } from 'bootstrap-vue';
import { UserProfile } from '@/store/modules/account';
import { IWithdrawals, Withdrawal } from '@/store/modules/withdrawals';
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
        BPagination,
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
    currentPage = 1;
    perPage = 10;
    total = 0;
    membership: Membership | null = null;

    // getters
    memberships!: IMemberships;
    profile!: UserProfile;
    withdrawals!: IWithdrawals;
    privateKey!: string;
    web3!: Web3;

    @Prop() npid!: NetworkProvider;

    get filteredWithdrawals() {
        if (!this.withdrawals[this.$router.currentRoute.params.id]) return [];

        return Object.values(this.withdrawals[this.$router.currentRoute.params.id]).filter(
            (w: Withdrawal) => w.page === this.currentPage,
        );
    }

    async onChange(page: number) {
        const { pagination, error } = await this.$store.dispatch('withdrawals/filter', {
            profile: this.profile,
            membership: this.membership,
            page,
            limit: this.perPage,
            state: 0, // 0 = Pending, 1 = Withdrawn
        });

        this.total = pagination.total;
        this.error = error;
    }

    async mounted() {
        this.busy = true;

        try {
            await this.$store.dispatch('account/getProfile');

            this.membership = await this.$store.dispatch('memberships/get', this.$route.params.id);

            if (this.membership) {
                await this.$store.dispatch('network/setNetwork', {
                    npid: this.membership.network,
                    privateKey: this.privateKey,
                });

                await this.onChange(this.currentPage);
            }
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.busy = false;
        }
    }
}
</script>
