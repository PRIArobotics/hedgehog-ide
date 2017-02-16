export enum SensorType {
    Analog,
    Digital
}

export default class Sensor {
    public type: SensorType;
    public port: number;
    public value: any;
}
