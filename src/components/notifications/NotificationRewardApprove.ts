import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { Account } from '@/models/Account';
import { mapGetters } from 'vuex';

@Component({
    name: 'NotificationRewardApprove',
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
export default class NotificationRewardApprove extends Vue {
    private loading: boolean = false;
    private account!: Account;

    @Prop() private notification!: Notification;

    private async approve() {
        this.loading = true;
        const reward = await this.notification.pool.getReward(this.notification.metadata.reward);
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
