<template>
    <b-modal id="modalAssetPool" @show="onShow()" centered scrollable title="Update asset pool membership">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <div :key="membership.assetPool" v-for="membership of profile.memberships">
                {{ membership.address }}
                <base-input-private-key
                    :value="profile.privateKeys[membership.address]"
                    @validated="assetPool.privateKeyValid = $event"
                />
            </div>
        </template>
        <template v-slot:modal-footer>
            <b-button class="btn-rounded" block variant="success" @click="set()">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Membership } from '@/store/modules/memberships';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '../../store/modules/account';
import BaseInputPrivateKey from '@/components/InputPrivateKey.vue';
import { BButton } from 'bootstrap-vue';

@Component({
    name: 'ModalAssetPool',
    components: {
        'b-button': BButton,
        'base-input-private-key': BaseInputPrivateKey,
    },
    computed: mapGetters({
        profile: 'account/profile',
        privateKey: 'account/privateKey',
        assetPools: 'assetPools/all',
    }),
})
export default class ModalSetAssetPool extends Vue {
    busy = false;
    error = '';

    profile!: UserProfile;

    @Prop() membership!: Membership;

    onShow() {
        this.busy = false;
        // Ask store to fetch asset pool info
        // Display title
        // Display owner
        // Display pool balance
        // Ask store to fetch member info for my account
        // Display account balance
    }

    set() {
        debugger;
    }
}
</script>
