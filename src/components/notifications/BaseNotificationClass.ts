import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { Account } from '@/models/Account';
import { IRewardPools } from '@/models/RewardPool';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseNotificationClass',
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
    },
    computed: {
        ...mapGetters('account', {
            account: 'account',
        }),
        ...mapGetters({
            rewardPools: 'rewardPools',
        }),
    },
})
export default class BaseNotificationClass extends Vue {
    @Prop() public notification!: Notification;

    public loading: boolean = false;
    private account!: Account;
    private rewardPools!: IRewardPools;

    get pool() {
        return this.rewardPools[this.notification.pool.address];
    }

    public async remove() {
        await this.$users.removeNotification(this.account.uid, this.notification.key);
        this.loading = false;
    }
}
