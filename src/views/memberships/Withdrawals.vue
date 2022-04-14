<template>
    <div>
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <div class="container pt-3 h-100 d-flex flex-column" v-if="!busy && membership && erc20">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert variant="info" show class="mb-3" v-if="!filteredWithdrawals.length">
                You have no scheduled or pending withdrawals for this pool.
            </b-alert>
            <div class="mb-auto">
                <base-list-group-item-withdrawal
                    :erc20="erc20"
                    :withdrawal="withdrawal"
                    :membership="membership"
                    :key="key"
                    v-for="(withdrawal, key) of filteredWithdrawals"
                />
            </div>
            <b-pagination
                class="mt-3"
                v-if="total > perPage"
                @change="onChange"
                v-model="currentPage"
                :per-page="perPage"
                :total-rows="total"
                align="fill"
            ></b-pagination>
            <b-button block variant="dark" to="/memberships" class="mt-3">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IWithdrawals, Withdrawal } from '@/store/modules/withdrawals';
import { Membership } from '@/store/modules/memberships';
import BaseListGroupItemWithdrawal from '@/components/BaseListGroupItemWithdrawal.vue';
import { ERC20 } from '@/store/modules/erc20';

@Component({
    components: {
        BaseListGroupItemWithdrawal,
    },
    computed: mapGetters({
        withdrawals: 'withdrawals/all',
        profile: 'account/profile',
    }),
})
export default class MembershipWithdrawalsView extends Vue {
    busy = false;
    error = '';
    currentPage = 1;
    perPage = 10;
    total = 0;
    membership: Membership | null = null;
    erc20: ERC20 | null = null;

    // getters
    profile!: UserProfile;
    withdrawals!: IWithdrawals;

    get filteredWithdrawals() {
        if (!this.withdrawals[this.$router.currentRoute.params.id]) return [];
        return Object.values(this.withdrawals[this.$router.currentRoute.params.id]).filter(
            (w: Withdrawal) => w.page === this.currentPage,
        );
    }

    async onChange(membership: Membership, page: number) {
        const { pagination, error } = await this.$store.dispatch('withdrawals/filter', {
            profile: this.profile,
            membership,
            page,
            limit: this.perPage,
            state: 0, // 0 = Pending, 1 = Withdrawn
        });
        this.total = pagination?.total;
        this.error = error;
    }

    async mounted() {
        this.$store
            .dispatch('memberships/get', this.$route.params.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                if (!membership) return;
                this.membership = membership;
                const { erc20 } = await this.$store.dispatch('erc20/get', membership.erc20);
                this.erc20 = erc20;
                await this.onChange(membership, this.currentPage);
            });
    }
}
</script>
