import { Vue } from 'vue-property-decorator';

const KEY = 'thx:wallet:state:';

export default class StateService extends Vue {
    public extdevPrivateKey: string = '';
    public rinkebyPrivateKey: string = '';
    private key: string;

    constructor(uid: string) {
        super();

        const key = KEY + uid;
        const state = localStorage.getItem(key);

        this.key = key;

        if (state !== null) {
            const rows = JSON.parse(state);

            for (const row in rows) {
                if (rows[row]) {
                    (this as any)[row] = rows[row];
                }
            }
        }

        this.save();
    }

    public clear() {
        this.extdevPrivateKey = '';
        this.rinkebyPrivateKey = '';

        return this.save();
    }

    public save() {
        const val = JSON.stringify({
            extdevPrivateKey: this.extdevPrivateKey,
            rinkebyPrivateKey: this.rinkebyPrivateKey,
        });
        localStorage.setItem(this.key, val);
    }
}
