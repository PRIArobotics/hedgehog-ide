import {Subject} from "rxjs";

// From https://github.com/Reactive-Extensions/RxJS/blob/master/doc/howdoi/eventemitter.md
export default class EventEmitter {
    private subjects: { [evt: string]: Subject<any> } = { };

    public emit (name: string, ...data: any[]): void {
        if (!this.subjects[name])
            this.subjects[name] = new Subject();

        this.subjects[name].next(data);
    }

    public on (name: string, handler: any): Subject<any> {
        if (!this.subjects[name])
            this.subjects[name] = new Subject();

        return <any> this.subjects[name].subscribe(handler);
    }

    public off (name: string, handler: Function): void {
        if (this.subjects[name]) {
            this.subjects[name].unsubscribe();
            delete this.subjects[name];
        }
    }

    public clear () {
        for (const prop of Object.keys(this.subjects)) {
            this.subjects[prop].unsubscribe();
        }

        this.subjects = {};
    }
}
