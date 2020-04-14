import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BCard, BOverlay } from 'bootstrap-vue';
import ProfilePicture from '@/components/ProfilePicture.vue';
import { Account } from '@/models/Account';
import { mapGetters } from 'vuex';

@Component({
    name: 'BaseNotification',
    components: {
        'b-overlay': BOverlay,
        'b-card': BCard,
        'profile-picture': ProfilePicture,
    },
    computed: {
        ...mapGetters({
            account: 'account',
        }),
    },
})
export default class BaseNotification extends Vue {
    private account!: Account;

    @Prop() private notification!: Notification;
    @Prop() private loading!: boolean;

    private async mounted() {
        const account = this.account;

        account.notifications[this.notification.key] = {
            pool: this.notification.pool.address,
            removed: false,
        };

        await this.$users.update(account);
    }

    private async remove() {
        this.$emit('loading', true);

        await this.$users.removeNotification(this.account.uid, this.notification.key);

        this.$emit('loading', false);
    }
}
