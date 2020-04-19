import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { Account } from '@/models/Account';
import { mapGetters } from 'vuex';

@Component({
    name: 'NotificationMembershipRequest',
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
    },
    computed: {
        ...mapGetters({
            account: 'account',
        }),
    },
})
export default class NotificationMembershipRequest extends Vue {
    @Prop() private notification!: Notification;

    private loading: boolean = false;
    private account!: Account;

    private async grant() {
        this.loading = true;
        this.notification.pool
            .addMember(this.notification.address)
            .then(async () => {
                this.remove();
            })
            .catch((e: string) => {
                this.loading = false;
            });
    }

    private async decline() {
        this.loading = true;
        this.remove();
    }

    private async remove() {
        await this.$users.removeNotification(this.account.uid, this.notification.key);
        this.loading = false;
    }
}
