export default class EventEmitter {
    private listeners: Map<string, Function[]> = new Map();

    public emit (name: string, ...data: any[]): void {
        if (!this.listeners.has(name))
            return;

        for(let func of this.listeners.get(name)) {
            func(...data);
        }
    }

    public on (name: string, handler: Function): void {
        if (!this.listeners.has(name))
            this.listeners.set(name, [ ]);

        this.listeners.get(name).push(handler);
    }
}
