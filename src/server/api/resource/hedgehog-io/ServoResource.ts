import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";

import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";
import ApiEndpoint from "../../ApiEndpoint";

export default class ServoResource extends ApiResource {
    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/servos');
    }

    @ApiEndpoint('PATCH', '/{servoId}')
    public setServo (req: Request, h: ResponseToolkit) {
        const servoPort = Number(req.params['servoId']);

        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties({
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}),
                    {
                        name: 'enabled',
                        required: RequirementType.Required
                    },
                    {
                        name: 'position',
                        required: RequirementType.Required
                    }
                )
            })
        });

        let requestData: JsonApiResource;
        try {
            requestData = parser.parse(req.payload).data as JsonApiResource;
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }


        this.hedgehog.setServo(servoPort, requestData.attributes.enabled ? Number(requestData.attributes.position) : null);
        return '';
    }
}
