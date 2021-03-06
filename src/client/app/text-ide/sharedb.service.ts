import io = require('socket.io-client');

import {Injectable, Inject} from "@angular/core";
import EventEmitter from "../program-execution/EventEmitter";
import {DOCUMENT} from "@angular/platform-browser";

import sharedb = require('sharedb/lib/client');
import {wrapCallbackAsPromise} from "../../../common/utils";
import SocketIoWebSocketAdapter from "./SocketIoWebSocketAdapter";
import {AuthProvider} from "../auth-provider.service";

@Injectable()
export class ShareDbClientService {
    private doc;

    private eventEmitter = new EventEmitter();
    constructor (@Inject(DOCUMENT) private document, private authProvider: AuthProvider) { }

    public async createConnection (programName: string) {
        // Open WebSocket connection to ShareDB server
        const host = `${document.location.protocol}//${document.location.hostname}:${document.location.port}`;
        let socket = io(host + '/realtime-sync', {query: {jwtToken: this.authProvider.token}});
        let connection = new sharedb.Connection(new SocketIoWebSocketAdapter(socket));

        this.doc = connection.get('hedgehog-ide', programName);
        await wrapCallbackAsPromise(this.doc.fetch.bind(this.doc));
        if (this.doc.type === null) {
            await wrapCallbackAsPromise(this.doc.create.bind(this.doc), {});
        }

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

    public fileExists (fileId: string) {
        return !!this.doc.data[fileId];
    }

    public operation(change) {
        this.doc.submitOp([change], err => {
            if (err) throw err;
        });
    }
}
