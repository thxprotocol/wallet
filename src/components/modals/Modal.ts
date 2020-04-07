import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BOverlay, BButton } from 'bootstrap-vue';

@Component({
    name: 'CModal',
    components: {
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-modal': BModal,
    },
})
export default class CModal extends Vue {
    @Prop() private id!: boolean;
    @Prop() private title!: boolean;
    @Prop() private loading!: boolean;
}
