import { HedgehogClient, Message, ack, vision } from 'hedgehog-client';

export default class SocketIoVisionAdapter {
    private ns: SocketIO.Namespace;
    private requests: Message[];
    private connectionCount: number = 0;
    private timer?: any = null;

    public constructor(private hedgehog: HedgehogClient, io: SocketIO.Server) {
        console.log("setup vision");
        this.ns = io.of('/vision');
        this.requests = [
            new vision.CaptureFrameAction(),
            new vision.FrameRequest(null),
        ];

        this.ns.on('connection', socket => {
            if (this.connectionCount === 0) {
                this.startUpdates();
            }
            this.connectionCount += 1;

            socket.on('disconnect', () => {
                this.connectionCount -= 1;
                if (this.connectionCount === 0) {
                    this.stopUpdates();
                }
            });
        });

    }

    private async startUpdates() {
        console.log("subscribe to vision");
        await this.hedgehog.openCamera();
        this.timer = setInterval(() => this.sendVisionUpdate(), 500);
    }

    private async stopUpdates() {
        clearInterval(this.timer);
        this.timer = null;
        await this.hedgehog.closeCamera();
        console.log("unsubscribe from vision");
    }

    private async sendVisionUpdate() {
        let [captureReply, frameReply] = await this.hedgehog.sendMultipart(...this.requests);
        if (captureReply.code !== ack.AcknowledgementCode.OK)
            return;

        if (!(frameReply instanceof vision.FrameReply))
            return;

        let frame = frameReply.frame;
        this.ns.emit('data', Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength));
    }
}
