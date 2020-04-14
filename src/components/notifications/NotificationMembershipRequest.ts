import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';

@Component({
    name: 'NotificationMembershipRequest',
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
    },
})
export default class NotificationMembershipRequest extends Vue {
    private loading: boolean = false;

    @Prop() private notification!: Notification;

    private async grant() {
        this.loading = true;
        this.notification.pool
            .addMember(this.notification.address)
            .then(() => {
                this.loading = false;
            })
            .catch((e: string) => {
                this.loading = false;
            });
    }

    private decline() {
        return;
    }
}
