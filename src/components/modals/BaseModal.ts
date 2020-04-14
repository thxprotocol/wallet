import { Component, Prop, Vue } from 'vue-property-decorator';
import { BModal, BOverlay, BButton, BAlert } from 'bootstrap-vue';

@Component({
    name: 'CModal',
    components: {
        'b-button': BButton,
        'b-overlay': BOverlay,
        'b-alert': BAlert,
        'b-modal': BModal,
    },
})
export default class CModal extends Vue {
    @Prop() private id!: boolean;
    @Prop() private title!: boolean;
    @Prop() private loading!: boolean;
    @Prop() private error!: string;
}
