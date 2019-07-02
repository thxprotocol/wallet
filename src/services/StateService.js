export default class StateService {
    constructor() {
        this.state = JSON.parse(localStorage.getItem('thx'));
    }

    get(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    set(key, val) {
        return localStorage.setItem(key, JSON.stringify(val));
    }

    remove(key) {
        localStorage.setItem(key, null);
        return delete localStorage[key];
    }

    clear() {
    }

}
