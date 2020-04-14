import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import Notification from '@/components/notifications/Notification.vue';
import { BSpinner, BCard, BCardText, BProgress, BProgressBar } from 'bootstrap-vue';
import { RewardPool } from '@/models/RewardPool';
import _ from 'lodash';

@Component({
    name: 'notifications',
    components: {
        'b-spinnner': BSpinner,
        'b-card': BCard,
        'b-card-text': BCardText,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
        'notification': Notification,
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
    private rewardPools!: { [address: string]: RewardPool };
    private notifications!: { [key: string]: Notification };
}
