import { Component } from 'vue-property-decorator';
import { BButton, BButtonGroup, BAlert } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import BaseNotificationClass from '@/components/notifications/BaseNotificationClass';

@Component({
    name: 'NotificationMembershipRequest',
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
        'b-alert': BAlert,
    },
})
export default class NotificationMembershipRequest extends BaseNotificationClass {
    private async grant() {
        this.loading = true;
        this.notification.pool
            .addMember(this.notification.address)
            .then(() => this.remove())
            .catch((e: string) => {
                this.loading = false;
            });
    }

    private async decline() {
        this.loading = true;
        this.remove();
    }
}
