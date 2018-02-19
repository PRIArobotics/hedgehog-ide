import {Duplex} from "stream";

/**
 * socket.io socket to JSON stream
 * Basically a socket.io port of https://github.com/avital/websocket-json-stream/blob/master/index.js
 */
export default class SocketIoJsonStream extends Duplex {
    public constructor (private socket: SocketIO.Socket) {
        super({objectMode: true});

        socket.on('message', (msg: any) => {
            this.push(JSON.parse(msg));
        });

        socket.on('disconnect', () => {
            this.push(null); // end readable stream
            this.end(); // end writable stream

            this.emit('close');
            this.emit('end');
        });

        this.on('error', () => socket.disconnect(true));
        this.on('end', () => socket.disconnect(true));
    }

    public _write (msg: any, encoding: string, next: (err?: Error) => void): void {
        this.socket.emit('message', msg);
        next();
    }

    public _read () {
        return null;
    }
}
