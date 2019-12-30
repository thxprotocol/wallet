import { Vue } from 'vue-property-decorator';

export class EventListener {
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
    listeners: any[] = [];

    public listen(e: string, callback: any) {
        const listener: EventListener = new EventListener(e, callback);
        const id = this.listeners.push(listener);

        window.addEventListener(listener.e, listener.cb);
        return id-1;
    }

    public dispatch(e: string, data: any = null) {
        const event = new CustomEvent(e, { detail: data });
        return window.dispatchEvent(event);
    }

    public remove(id: number) {
        window.removeEventListener(this.listeners[id].e, this.listeners[id].cb);
        return delete this.listeners[id];
    }
}