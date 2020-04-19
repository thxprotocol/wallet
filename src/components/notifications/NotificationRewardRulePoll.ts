import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { Account } from '@/models/Account';
import { mapGetters } from 'vuex';
import { Reward } from '@/models/Reward';
import { IRewardPools } from '@/models/RewardPool';

@Component({
    name: 'NotificationRewardClaim',
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
    },
    computed: {
        ...mapGetters({
            account: 'account',
            rewardPools: 'rewardPools',
        }),
    },
})
export default class NotificationRewardClaim extends Vue {
    private loading: boolean = false;
    private account!: Account;
    private rewardPools!: IRewardPools;

    @Prop() private notification!: Notification;

    get reward() {
        return this.rewardPools[this.notification.pool.address].rewards[this.notification.metadata.reward];
    }

    private async approve() {
        this.loading = true;
        if (this.reward) {
            this.notification.pool
                .voteForReward(this.reward, true)
                .then(() => this.remove())
                .catch(() => {
                    this.loading = false;
                });
        }
    }

    private async decline() {
        this.loading = true;
        if (this.reward) {
            this.notification.pool
                .voteForReward(this.reward, false)
                .then(() => this.remove())
                .catch(() => {
                    this.loading = false;
                });
        }
    }

    private async remove() {
        await this.$users.removeNotification(this.account.uid, this.notification.key);
        this.loading = false;
    }
}
