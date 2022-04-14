<template>
    <div>
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <div class="container pt-3 h-100 d-flex flex-column" v-if="!busy">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert variant="info" show class="mb-3" v-if="!promotions.length">
                There are no promotions for this pool.
            </b-alert>
            <base-list-group-item-promotion
                :erc20="erc20"
                :promotion="promotion"
                :membership="membership"
                :key="promotion.id"
                v-for="promotion of promotions"
            />
            <b-button block variant="dark" to="/memberships" class="mt-3">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Membership } from '@/store/modules/memberships';
import BaseListGroupItemPromotion from '@/components/BaseListGroupItemPromotion.vue';
import { IPromoCodes } from '@/store/modules/promocodes';
import { ERC20 } from '@/store/modules/erc20';

@Component({
    components: {
        BaseListGroupItemPromotion,
    },
    computed: mapGetters({
        promocodes: 'promocodes/all',
    }),
})
export default class MembershipPromotionsView extends Vue {
    busy = false;
    error = '';
    currentPage = 1;
    perPage = 10;
    total = 0;
    membership: Membership | null = null;
    erc20: ERC20 | null = null;

    // getters
    promocodes!: IPromoCodes;

    get promotions() {
        if (!this.membership) return [];
        if (!this.promocodes[this.membership.id]) return [];
        return Object.values(this.promocodes[this.membership.id]);
    }

    async mounted() {
        this.$store
            .dispatch('memberships/get', this.$route.params.id)
            .then(async ({ membership }: { membership: Membership; error: Error }) => {
                this.membership = membership;
                const { erc20 } = await this.$store.dispatch('erc20/get', membership.erc20);
                this.erc20 = erc20;
                await this.$store.dispatch('promocodes/filter', { membership: this.membership });
            });
    }
}
</script>
