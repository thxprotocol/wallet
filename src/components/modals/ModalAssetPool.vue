<template>
    <b-modal id="modalAssetPool" @show="onShow()" centered scrollable title="Update asset pool membership">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <code>{{ membership.address }}</code>
        </template>
        <template v-slot:modal-footer>
            <b-button class="btn-rounded" block variant="success" @click="update()">
                Update
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Membership } from '@/store/modules/memberships';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { BButton } from 'bootstrap-vue';

@Component({
    name: 'ModalAssetPool',
    components: {
        'b-button': BButton,
    },
    computed: mapGetters({}),
})
export default class ModalSetAssetPool extends Vue {
    busy = false;
    error = '';

    @Prop() membership!: Membership;

    onShow() {
        this.busy = false;
    }

    update() {
        debugger;
    }
}
</script>
