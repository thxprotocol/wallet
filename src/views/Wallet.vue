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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { NetworkProvider } from '@/utils/network';
import { IMemberships } from '@/store/modules/memberships';
import { UserProfile } from '@/store/modules/account';

@Component({
    components: {
        'base-list-group-item-token': BaseListGroupItemToken,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        memberships: 'memberships/all',
    }),
})
export default class Wallet extends Vue {
    busy = false;
    error = '';

    @Prop() npid!: NetworkProvider;

    memberships!: IMemberships;
    profile!: UserProfile;

    async mounted() {
        await this.$store.dispatch('memberships/getAll');
    }
}
</script>
