import { Component, Prop, Vue } from 'vue-property-decorator';
import { Notification } from '@/models/Notification';
import { BCard, BButton, BButtonGroup } from 'bootstrap-vue';
import ProfilePicture from '@/components/ProfilePicture.vue';

@Component({
    name: 'Notification',
    components: {
        'b-card': BCard,
        'b-button': BButton,
        'b-button-group': BButtonGroup,
        'profile-picture': ProfilePicture,
    },
})
export default class CNotification extends Vue {
    private loading: boolean = false;
    @Prop() private notification!: Notification;
}
