export default class EventAggregator {
    public listeners: Array<{
        e: string,
        cb: Function,
    }>;

    constructor() {
        this.listeners = [];
    }

    public listen(e: string, callback: Function) {
        const listener = {
            e,
            cb: callback,
        };
        const id = this.listeners.push(listener);

        window.addEventListener(listener.e, listener.cb);

        return id - 1;
    }

    public dispatch(e: string, data: any) {
        const event = new CustomEvent(e, { detail: data });
        return window.dispatchEvent(event);
    }

    public remove(id: number) {
        window.removeEventListener(this.listeners[id].e, this.listeners[id].cb);
        return delete this.listeners[id];
    }

}
