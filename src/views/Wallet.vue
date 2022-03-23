<template>
    <div v-if="profile">
        <b-list-group>
            <base-list-group-item-token
                :membership="membership"
                :key="membership.id"
                v-for="membership in memberships"
            />
        </b-list-group>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@/components/BaseListGroupItemToken.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IMemberships } from '@/store/modules/memberships';
import { UserProfile } from '@/store/modules/account';

@Component({
    components: {
        'base-list-group-item-token': BaseListGroupItemToken,
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

    async mounted() {
        await this.$store.dispatch('memberships/getAll');
    }
}
</script>
