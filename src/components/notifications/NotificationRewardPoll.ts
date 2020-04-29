import { Component } from 'vue-property-decorator';
import { BButton, BButtonGroup, BAlert } from 'bootstrap-vue';
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
        'b-alert': BAlert,
    },
})
export default class NotificationRewardPoll extends BaseNotificationClass {
    private now: number = Math.floor(new Date().getTime() / 1000);

    get reward(): Reward | null {
        return this.pool && this.pool.rewards.length ? this.pool.rewards[this.notification.metadata.reward] : null;
    }

    get isMember(): boolean | null {
        return (
            this.pool &&
            this.pool.members.find((m) => {
                return (this.reward && this.reward.beneficiaryAddress === m.address) || false;
            })
        );
    }

    private async invite() {
        this.loading = true;
        if (this.reward) {
            this.notification.pool
                .addMember(this.reward.beneficiaryAddress)
                .then(() => this.remove())
                .catch(() => {
                    this.loading = false;
                });
        }
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
