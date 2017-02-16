import Hapi = require('hapi');
import winston = require("winston");
import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import {IReply} from "hapi";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl, getRequestUrl} from "../../../utils";
import {SensorType, default as Sensor} from "../../../../common/Sensor";
import {DataType} from "../../../jsonapi/JsonApiBuilder";

export default class SensorResource extends ApiResource {

    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/sensors');
    }

    @ApiEndpoint('GET', '/{sensorId}')
    public async getSensor (req: Hapi.Request, reply: IReply) {
        const sensorPort = Number(req.params['sensorId']);

        let sensor = new Sensor();
        sensor.port = sensorPort;

        if(sensorPort < 8) {
            sensor.value = await this.hedgehog.getAnalog(sensorPort);
            sensor.type = SensorType.Analog;
        } else {
            sensor.value = await this.hedgehog.getDigital(sensorPort);
            sensor.type = SensorType.Digital;
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/sensors/${sensorPort}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(sensor, req, documentBuilder));
        return reply(documentBuilder.getProduct());
    }

    @ApiEndpoint('GET')
    public async getSensorList (req: Hapi.Request, reply: IReply) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getRequestUrl(req), null);
        documentBuilder.setDataType(DataType.Many);

        for (let i = 0; i < 15; i++) {
            let sensor = new Sensor();
            sensor.port = i;

            if(i < 8) {
                sensor.value = await this.hedgehog.getAnalog(i);
                sensor.type = SensorType.Analog;
            } else {
                sensor.value = await this.hedgehog.getDigital(i);
                sensor.type = SensorType.Digital;
            }

            documentBuilder.addResource(await this.serializerRegistry.serialize(sensor, req, documentBuilder));
        }

        return reply(documentBuilder.getProduct());
    }
}
