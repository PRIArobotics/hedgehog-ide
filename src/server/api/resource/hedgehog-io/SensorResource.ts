import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";
import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import {getLinkUrl, getRequestUrl} from "../../../utils";
import {SensorType, default as Sensor} from "../../../../common/Sensor";
import {default as JsonApiDocumentBuilder , DataType} from "../../../jsonapi/JsonApiBuilder";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";

export default class SensorResource extends ApiResource {

    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/sensors');
    }

    @ApiEndpoint('GET', '/{sensorId}')
    public async getSensor (req: Request) {
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
        return documentBuilder.getProduct();
    }

    @ApiEndpoint('GET')
    public async getSensorList (req: Request) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getRequestUrl(req), null);
        documentBuilder.setDataType(DataType.Many);

        for (let i = 0; i < 16; i++) {
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

        return documentBuilder.getProduct();
    }

    @ApiEndpoint('PATCH', '/{sensorId}')
    public async setSensorPullup (req: Request, h: ResponseToolkit) {
        const sensorPort = Number(req.params['sensorId']);

        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties({
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}), {
                    name: 'pullup',
                    required: RequirementType.Required
                })
            })
        });

        let pullup: boolean;
        try {
            pullup = (parser.parse(req.payload).data as JsonApiResource).attributes.pullup;
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }
        await this.hedgehog.setInputState(sensorPort, pullup);
        return this.getSensor(req);
    }
}
