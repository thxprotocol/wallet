import { Vue } from 'vue-property-decorator';

class EventListener {
    public e: string;
    public cb: any;

    constructor(
        e: string,
        cb: any,
    ) {
        this.e = e;
        this.cb = cb;
    }
}

export default class EventService extends Vue {
    public listeners: any[] = [];

    public listen(e: string, callback: any) {
        const listener: EventListener = new EventListener(e, callback);
        const id = this.listeners.push(listener);

        window.addEventListener(listener.e, listener.cb);
        return id - 1;
    }

    public dispatch(e: string, data: any = null) {
        const event = new CustomEvent(e, { detail: data });
        
        window.dispatchEvent(event);
    }

    public remove(id: number) {
        window.removeEventListener(this.listeners[id].e, this.listeners[id].cb);

        delete this.listeners[id];
    }
}
