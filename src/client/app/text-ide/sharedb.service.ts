import {Injectable} from '@angular/core';

import sharedb = require('sharedb/lib/client');
import EventEmitter from "../program-execution/EventEmitter";

@Injectable()
export class ShareDbClientService {
    private doc;

    private eventEmitter = new EventEmitter();
    private _ignore: boolean;

    public constructor (programName: string) {
        // Open WebSocket connection to ShareDB server
        let socket = new WebSocket('ws://' + window.location.host);
        let connection = new sharedb.Connection(socket);
        this.doc = connection.get('hedgehog-ide', programName);

        const emitData = () => {
            this.eventEmitter.emit('data', this.doc.data);
            console.log(this.doc.data);
        };

        this.doc.subscribe(emitData());

        this.doc.on('op', () => {
            if (!this._ignore) {
                emitData();
            }
        });
    }

    public on (event: string, handler: Function) {
        this.eventEmitter.on(event, handler);
    }

    public operation(change) {
        this.doc.submitOp([change]);
    }

    get ignore(): boolean {
        return this._ignore;
    }

    set ignore(value: boolean) {
        this._ignore = value;
    }
}
