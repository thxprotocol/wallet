<template>
    <div v-if="profile">
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="primary" />
        </div>
        <div class="h-100 d-flex flex-column" v-if="!busy && membership">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <div class="mb-3 text-center">
                <strong>Available Swaps</strong>
            </div>
            <b-alert variant="info" show class="mb-3" v-if="!filteredERC20SwapRules.length">
                There are no Swap Rules set yet.
            </b-alert>
            <div class="mb-auto" v-else>
                <base-list-group-item-swap-rule
                    :membership="membership"
                    :swaprule="swaprule"
                    :key="key"
                    v-for="(swaprule, key) of filteredERC20SwapRules"
                />
                <b-pagination
                    class="mt-3"
                    v-if="total > perPage"
                    @change="onChange"
                    v-model="currentPage"
                    :per-page="perPage"
                    :total-rows="total"
                    align="fill"
                ></b-pagination>
            </div>
            <b-button block variant="dark" to="/memberships" class="mx-3 w-auto m-md-0 mt-3">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ERC20SwapRuleExtended, IERC20SwapRules } from '@/store/modules/erc20swaprules';
import { IMemberships } from '@/store/modules/memberships';

import { TNetworks } from '@/store/modules/network';
import BaseListGroupItemSwapRule from '@/components/BaseListGroupItemSwapRule.vue';
import { UserProfile } from '@/store/modules/account';

@Component({
    components: {
        BaseListGroupItemSwapRule,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        swaprules: 'erc20swaprules/all',
        memberships: 'memberships/all',
    }),
})
export default class MembershipERC20SwapRulesView extends Vue {
    busy = true;
    error = '';
    currentPage = 1;
    perPage = 10;
    total = 0;

    // getters
    profile!: UserProfile;
    swaprules!: IERC20SwapRules;
    memberships!: IMemberships;
    networks!: TNetworks;

    get membership() {
        return this.memberships[this.$router.currentRoute.params.id];
    }

    get filteredERC20SwapRules() {
        if (!this.swaprules[this.$router.currentRoute.params.id]) return [];
        const result = Object.values(this.swaprules[this.$router.currentRoute.params.id]).filter(
            (x: ERC20SwapRuleExtended) => x.page === this.currentPage,
        );
        return result;
    }

    async onChange(page: number) {
        const { pagination, error } = await this.$store.dispatch('erc20swaprules/filter', {
            membership: this.membership,
            page,
            limit: this.perPage,
        });
        this.total = pagination?.total;
        this.error = error;
    }

    async mounted() {
        this.onChange(this.currentPage);
        this.busy = false;
    }
}
</script>
