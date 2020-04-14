import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import NotificationMembershipRequest from '@/components/notifications/NotificationMembershipRequest.vue';

@Component({
    name: 'notifications',
    components: {
        'notification-membership-request': NotificationMembershipRequest,
    },
    computed: {
        ...mapGetters({
            rewardPools: 'rewardPools',
            notifications: 'notifications',
        }),
    },
})
export default class Notifications extends Vue {
    public error: string = '';
    public loading: any = false;
    private notifications!: { [key: string]: Notification };
}
