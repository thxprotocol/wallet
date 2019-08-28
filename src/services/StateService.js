const KEY = 'THX:StateService';

export default class StateService {
    loomPrivateKey = null;
    rinkebyPrivateKey = null;

    constructor() {
        const state = localStorage.getItem(KEY);

        if (state !== null) {
            const rows = JSON.parse(state);

            for (let row in rows) {
                this[row] = rows[row];
            }
        }
    }

    clear() {
        this.loomPrivateKey = null;
        this.rinkebyPrivateKey = null;

        return this.save();
    }

    save() {
        const val = JSON.stringify({
            loomPrivateKey: this.loomPrivateKey,
            rinkebyPrivateKey: this.rinkebyPrivateKey,
        });
        localStorage.setItem(KEY, val)
    }
}
