import { HedgehogClient, Message, ack, vision } from 'hedgehog-client';

class VisionNamespace {
    public connectionCount: number = 0;

    public constructor(
        public ns: SocketIO.Namespace,
        onConnect: () => void,
        onDisconnect: () => void,
    ) {
        this.ns.on('connection', socket => {
            onConnect();
            this.connectionCount += 1;

            socket.on('disconnect', () => {
                this.connectionCount -= 1;
                onDisconnect();
            });
        });
    }

    public async sendUpdate(hedgehog: HedgehogClient, highlight?: string) {
        if (this.connectionCount === 0)
            return;

        let frame = await hedgehog.getFrame(highlight);
        (this.ns as any).volatile.emit('data', Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength));
    }
}

export default class SocketIoVisionAdapter {
    private vision: VisionNamespace;
    private faces: VisionNamespace;
    private blobs: VisionNamespace;

    private blobsRange: SocketIO.Namespace;
    private timer?: any = null;

    public constructor(private hedgehog: HedgehogClient, io: SocketIO.Server) {
        console.log("setup vision");
        let onConnect = () => this.startUpdates();
        let onDisconnect = () => this.stopUpdates();
        this.vision = new VisionNamespace(io.of('/vision'), onConnect, onDisconnect);
        this.faces = new VisionNamespace(io.of('/vision-faces'), onConnect, onDisconnect);
        this.blobs = new VisionNamespace(io.of('/vision-blobs'), onConnect, onDisconnect);

        this.blobsRange = io.of('/vision-blobs-range');
        this.blobsRange.on('connection', socket => {
            socket.on('data', (hsvMin, hsvMax) => {
                console.log(hsvMin, hsvMax);
                this.hedgehog.updateChannel('ide.blobs', {
                    kind: vision.ChannelKind.BLOBS,
                    hsvMin,
                    hsvMax,
                });
            });
        });
    }

    private async startUpdates() {
        if (
            this.vision.connectionCount === 0 &&
            this.faces.connectionCount === 0 &&
            this.blobs.connectionCount === 0
        ) {
            console.log("subscribe to vision");
            await this.hedgehog.openCamera();
            await this.hedgehog.createChannel('ide.faces', {
                kind: vision.ChannelKind.FACES,
            });
            await this.hedgehog.createChannel('ide.blobs', {
                kind: vision.ChannelKind.BLOBS,
                hsvMin: 0x461414,
                hsvMax: 0x5AFFEA,
            });
            this.timer = setInterval(() => this.sendVisionUpdate(), 100);
        }
    }

    private async stopUpdates() {
        if (
            this.vision.connectionCount === 0 &&
            this.faces.connectionCount === 0 &&
            this.blobs.connectionCount === 0
        ) {
            clearInterval(this.timer);
            this.timer = null;
            await this.hedgehog.deleteChannel('ide.faces');
            await this.hedgehog.deleteChannel('ide.blobs');
            await this.hedgehog.closeCamera();
            console.log("unsubscribe from vision");
        }
    }

    private async sendVisionUpdate() {
        await this.hedgehog.captureFrame();
        await this.vision.sendUpdate(this.hedgehog);
        await this.faces.sendUpdate(this.hedgehog, 'ide.faces');
        await this.blobs.sendUpdate(this.hedgehog, 'ide.blobs');
    }
}
