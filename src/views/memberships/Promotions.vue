<template>
    <div>
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="primary" />
        </div>
        <div class="h-100 d-flex flex-column" v-if="!busy">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert variant="info" show class="mb-3" v-if="!Object.values(promotions).length">
                There are no running promotions for this pool.
            </b-alert>
            <base-list-group-item-promotion
                :erc20="erc20"
                :promotion="promotion"
                :membership="membership"
                :key="promotion.id"
                v-for="promotion of filteredPromotions"
            />
            <b-button block variant="dark" to="/memberships" class="mt-3">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { IMemberships } from '@/store/modules/memberships';
import BaseListGroupItemPromotion from '@/components/list-items/BaseListGroupItemPromotion.vue';
import { IPromotions } from '@/store/modules/promotions';
import { TERC20 } from '@/store/modules/erc20';

@Component({
    components: {
        BaseListGroupItemPromotion,
    },
    computed: {
        ...mapState('erc20', ['erc20s']),
        ...mapGetters({
            promotions: 'promotions/all',
            memberships: 'memberships/all',
        }),
    },
})
export default class MembershipPromotionsView extends Vue {
    busy = true;
    error = '';
    currentPage = 1;
    perPage = 10;
    total = 0;

    // getters
    promotions!: IPromotions;
    memberships!: IMemberships;
    erc20s!: { [id: string]: TERC20 };

    get membership() {
        return this.memberships[this.$router.currentRoute.params.id];
    }

    get erc20() {
        if (!this.membership) return null;
        return this.erc20s[this.membership.erc20Id];
    }

    get filteredPromotions() {
        if (!this.membership) return [];
        if (!this.promotions[this.membership._id]) return [];
        return Object.values(this.promotions[this.membership._id]);
    }

    async mounted() {
        this.$store.dispatch('memberships/get', this.$route.params.id).then(async () => {
            await this.$store.dispatch('erc20/getContract', this.membership.erc20Id);
            await this.$store.dispatch('promotions/filter', { membership: this.membership });
            this.busy = false;
        });
    }
}
</script>
