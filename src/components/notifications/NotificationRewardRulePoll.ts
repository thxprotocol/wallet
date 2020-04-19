import { Component, Prop, Vue } from 'vue-property-decorator';
import { BButton, BButtonGroup } from 'bootstrap-vue';
import BaseNotification from '@/components/notifications/BaseNotification.vue';
import { mapGetters } from 'vuex';
import { RewardRule } from '@/models/RewardRule';

@Component({
    name: 'NotificationRewardRulePoll',
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
export default class NotificationRewardRulePoll extends Vue {
    @Prop() private rule!:RewardRule;
}
