import { Component } from 'vue-property-decorator';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { Reward } from '@/models/Reward';
import BaseNotificationClass from '@/components/notifications/BaseNotificationClass';
import BasePoll from '@/components/BasePoll.vue';

@Component({
    name: 'NotificationRewardPoll',
    timers: {
        update: {
            time: 5000,
            repeat: true,
            autostart: false,
        },
    },
    components: {
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'base-notification': BaseNotification,
        'base-poll': BasePoll,
    },
})
export default class NotificationRewardPoll extends BaseNotificationClass {
    private now: number = Math.floor(new Date().getTime() / 1000);

    get reward(): Reward | null {
        return this.pool && this.pool.rewards.length ? this.pool.rewards[this.notification.metadata.reward] : null;
    }

    private async update() {
        if (this.reward) {
            this.now = await this.$network.now();

            await this.reward.update();

            if (this.now > this.reward.endTime) {
                this.$timer.stop('update');
            }
        }
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
}
