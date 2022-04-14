<template>
    <div v-if="profile">
        <b-list-group>
            <base-list-group-item-token
                :membership="membership"
                :key="membership.id"
                v-for="membership in uniqueMembershipTokens"
            />
        </b-list-group>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@/components/BaseListGroupItemToken.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IMemberships, Membership } from '@/store/modules/memberships';
import { UserProfile } from '@/store/modules/account';

@Component({
    components: {
        BaseListGroupItemToken,
    },
    computed: mapGetters({
        profile: 'account/profile',
        memberships: 'memberships/all',
    }),
})
export default class Wallet extends Vue {
    busy = false;
    error = '';

    memberships!: IMemberships;
    profile!: UserProfile;

    get uniqueMembershipTokens() {
        const filtered: Membership[] = [];
        for (const id in this.memberships) {
            if (
                this.memberships[id].erc20 &&
                filtered.findIndex((membership: Membership) => this.memberships[id].erc20 === membership.erc20) === -1
            ) {
                filtered.push(this.memberships[id]);
            }
        }
        return filtered;
    }

    mounted() {
        this.$store.dispatch('memberships/getAll').then(() => {
            for (const id in this.memberships) {
                this.$store.dispatch('memberships/get', id);
            }
        });
    }
}
</script>
