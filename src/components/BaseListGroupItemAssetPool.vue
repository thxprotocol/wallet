<template>
    <b-list-group-item
        v-if="membership"
        :to="`/pools/${membership.poolAddress}`"
        class="d-flex justify-content-between align-items-center"
        :class="{ disabled: !membership.poolToken }"
    >
        <div class="mr-auto d-flex align-items-center" v-if="membership.title">
            <strong>{{ membership.title }}</strong>
            <b-badge class="text-overflow-75 ml-3" variant="secondary" pill>
                {{ membership.poolAddress }}
            </b-badge>
        </div>

        <div class="text-muted mr-auto" v-else>
            {{ membership.poolAddress }}
        </div>

        <b-badge class="mr-3" variant="secondary" pill v-if="membership.isManager">
            Manager
        </b-badge>

        <b-badge variant="primary" pill v-if="membership.poolToken">
            {{ membership.poolToken.balance }} {{ membership.poolToken.symbol }}
        </b-badge>
    </b-list-group-item>
</template>

<script lang="ts">
import { BLink, BAlert, BButton, BSpinner, BListGroupItem, BListGroup, BBadge } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@/store/modules/account';
import { IMemberships } from '@/store/modules/memberships';

@Component({
    components: {
        'b-alert': BAlert,
        'b-link': BLink,
        'b-spinner': BSpinner,
        'b-button': BButton,
        'b-badge': BBadge,
        'b-list-group': BListGroup,
        'b-list-group-item': BListGroupItem,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class BaseListGroupItemAssetPool extends Vue {
    busy = true;

    // getters
    profile!: UserProfile;
    memberships!: IMemberships;

    @Prop() poolAddress!: string;

    get membership() {
        return this.memberships[this.poolAddress];
    }

    async mounted() {
        try {
            await this.$store.dispatch('memberships/read', { profile: this.profile, poolAddress: this.poolAddress });
        } catch (e) {
            console.dir(e);
        } finally {
            this.busy = false;
        }
    }
}
</script>
