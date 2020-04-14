import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import NotificationMembershipRequest from '@/components/notifications/NotificationMembershipRequest.vue';
import { Notification } from '@/models/Notification';

@Component({
    name: 'notifications',
    components: {
        'notification-membership-request': NotificationMembershipRequest,
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
