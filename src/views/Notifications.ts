import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import NotificationMembershipRequest from '@/components/notifications/NotificationMembershipRequest.vue';
import NotificationRewardPoll from '@/components/notifications/NotificationRewardPoll.vue';
import NotificationRewardRulePoll from '@/components/notifications/NotificationRewardRulePoll.vue';
import { Notification } from '@/models/Notification';

@Component({
    name: 'notifications',
    components: {
        'notification-membership-request': NotificationMembershipRequest,
        'notification-reward-claim': NotificationRewardPoll,
        'notification-reward-rule-poll': NotificationRewardRulePoll,
    },
    computed: {
        ...mapGetters({
            notifications: 'notifications',
        }),
    },
})
export default class Notifications extends Vue {
    public error: string = '';
    public loading: any = false;
    private notifications!: { [key: string]: Notification };
}
