import { Component, Prop, Vue } from 'vue-property-decorator';
import { BProgress, BProgressBar, BRow, BCol } from 'bootstrap-vue';
import { IBasePoll } from '@/models/BasePoll';

@Component({
    name: 'BasePoll',
    components: {
        'b-col': BCol,
        'b-row': BRow,
        'b-progress': BProgress,
        'b-progress-bar': BProgressBar,
    },
})
export default class BasePoll extends Vue {
    @Prop() private poll!: IBasePoll;
    @Prop() private now!: number;
    
    private async mounted() {
        if (this.poll) {
            await this.poll.updateBasePoll();
        
            if (this.now < this.poll.endTime) {    
                this.$emit('start');
            }
        }
    }
}
