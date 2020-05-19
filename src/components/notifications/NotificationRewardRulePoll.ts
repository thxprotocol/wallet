import { Component } from 'vue-property-decorator';
import { BButton, BButtonGroup, BAlert } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { RewardRule } from '@/models/RewardRule';
import BaseNotificationClass from '@/components/notifications/BaseNotificationClass';
import BasePoll from '@/components/BasePoll.vue';

@Component({
    name: 'NotificationRewardRulePoll',
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
        'b-alert': BAlert,
    },
})
export default class NotificationRewardRulePoll extends BaseNotificationClass {
    private now: number = Math.floor(new Date().getTime() / 1000);

    get rewardRule(): RewardRule | null {
        return this.pool && this.pool.rewardRules.length
            ? this.pool.rewardRules[this.notification.metadata.rule]
            : null;
    }

    private async update() {
        if (this.rewardRule && this.rewardRule.poll) {
            this.now = await this.$network.now();

            await this.rewardRule.poll.updateBasePoll();

            if (this.now > this.rewardRule.poll.endTime) {
                this.$timer.stop('update');
            }
        }
        this.loading = false;
    }

    private async approve() {
        this.loading = true;
        if (this.rewardRule) {
            this.notification.pool
                .voteForRule(this.rewardRule, true)
                .then(() => this.remove())
                .catch(() => {
                    this.loading = false;
                });
        }
    }

    private async decline() {
        this.loading = true;
        if (this.rewardRule) {
            this.notification.pool
                .voteForRule(this.rewardRule, false)
                .then(() => this.remove())
                .catch(() => {
                    this.loading = false;
                });
        }
    }
}
