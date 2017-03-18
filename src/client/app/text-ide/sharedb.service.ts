import {Injectable, Inject} from "@angular/core";
import EventEmitter from "../program-execution/EventEmitter";
import {DOCUMENT} from "@angular/platform-browser";

import sharedb = require('sharedb/lib/client');

@Injectable()
export class ShareDbClientService {
    private doc;

    private eventEmitter = new EventEmitter();
    private _ignore: boolean;

    constructor (@Inject(DOCUMENT) private document) { }

    public createConnection (programName: string) {
        // Open WebSocket connection to ShareDB server
        let socket = new WebSocket('ws://' + this.document.location.hostname + ':8001');
        let connection = new sharedb.Connection(socket);

        this.doc = connection.get('hedgehog-ide', programName);

        this.doc.subscribe(() => {
            this.eventEmitter.emit('firstData', this.doc.data);
        });

        this.doc.on('op', (op, source) => {
            this.eventEmitter.emit('operations', {
                operations: op,
                data: this.doc.data,
                source
            });
        });
    }

    public on (event: string, handler: Function) {
        this.eventEmitter.on(event, handler);
    }

    public operation(change) {
        if (!this._ignore) {
            this.doc.submitOp([change], err => {
                if (err) throw err;
            });
        }
    }

    get ignore(): boolean {
        return this._ignore;
    }

    set ignore(value: boolean) {
        this._ignore = value;
    }
}
