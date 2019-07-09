const KEY = 'THX:StateService';

export default class StateService {
    state = {};

    constructor(
    ) {
        this.load();
    }

    load() {
        const state = localStorage.getItem(KEY);

        if (state !== null) {
            const rows = JSON.parse(state);

            for (let i in rows) {
                this.state[i] = rows[i];
            }
        }
    }

    setItem(key, value) {
        this.state[key] = value;
        this.save();
    }

    getItem(key) {
        return this.state[key];
    }

    save() {
        const val = JSON.stringify(this.state);
        localStorage.setItem(KEY, val)
    }

    clear() {
        this.state = null;
        this.save();
    }
}
