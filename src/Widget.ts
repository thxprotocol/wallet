import { Component, Prop, Vue } from 'vue-property-decorator';

const QRCode = window.QRCode;

@Component({
    name: 'Widget',
})
export default class Widget extends Vue {
    public mounted() {
        if (this.$route.params.rule && this.$route.params.pool) {
            QRCode.toCanvas(
                document.getElementById('canvas'),
                JSON.stringify({
                     rule: parseInt(this.$route.params.rule, 10),
                     pool: this.$route.params.pool,
                }),
                (error: string) => {
                    if (error) {
                        // eslint-disable-next-line
                        console.error(error);
                    }
                    // eslint-disable-next-line
                    console.log('success');
                },
            );
        }
    }
}
