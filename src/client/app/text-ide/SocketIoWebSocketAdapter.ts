export default class SocketIoWebSocketAdapter {
    public onopen: EventListener = null;
    public onerror: EventListener = null;
    public onclose: EventListener = null;
    public onmessage: EventListener = null;

    private status: number =  	0;

    public constructor (private socket: SocketIOClient.Socket) {
        socket.on('connect', () => {
            this.status = 1;
            if (this.onopen)
                this.onopen(new Event('open'));
        });

        socket.on('error', () => {
            if (this.onerror)
                this.onerror(new Event('error'));
        });

        socket.on('disconnect', () => {
            this.status = 3;
            if (this.onclose)
                this.onclose(new CloseEvent('socket closed'));
        });

        socket.on('message', msg => {
            if (this.onmessage)
                this.onmessage(new MessageEvent('message', {data: msg}));
        });
    }

    get readyState (): number {
        return this.status;
    }

    public close () {
        this.status = 2;
        this.socket.disconnect();
    }

    public send (msg: any) {
        this.socket.emit('message', msg);
    }
}
