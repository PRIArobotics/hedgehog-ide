import {HedgehogClient} from 'hedgehog-client';

export default class SocketIoSensorAdapter {
    private ns: SocketIO.Namespace;

    public constructor (private hedgehog: HedgehogClient, io: SocketIO.Server) {
        this.ns = io.of('/sensors');
        setInterval(async () => await this.sendSensorUpdate(), 100);
    }

    private async sendSensorUpdate () {
        let sensorData: Array<{id: number, value: number, type: string}> = [];
        for (let port = 0; port < 16; port++) {
            if (port < 8) {
                sensorData.push({
                    id: port,
                    type: 'analog',
                    value: await this.hedgehog.getAnalog(port)
                });
            } else {
                sensorData.push({
                    id: port,
                    type: 'digital',
                    value: await this.hedgehog.getDigital(port)? 1 : 0
                });
            }
        }

        this.ns.emit('data', sensorData);
    }
}
