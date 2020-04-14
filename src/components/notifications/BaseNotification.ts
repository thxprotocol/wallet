import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BCard, BOverlay } from 'bootstrap-vue';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'BaseNotification',
    components: {
        'b-overlay': BOverlay,
        'b-card': BCard,
        'profile-picture': ProfilePicture,
    },
})
export default class BaseNotification extends Vue {
    @Prop() private notification!: Notification;
    @Prop() private loading!: boolean;
}
