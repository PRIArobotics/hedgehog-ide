import Hapi = require('hapi');
import winston = require("winston");
import {HedgehogClient, MotorState} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {IReply} from "hapi";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";
import ApiEndpoint from "../../ApiEndpoint";

export default class MotorResource extends ApiResource {
    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/motors');
    }

    @ApiEndpoint('PATCH', '/{motorId}')
    public setMotor (req: Hapi.Request, reply: IReply) {
        const motorPort = Number(req.params['motorId']);

        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties({
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}),
                    {
                        name: 'power',
                        required: object => !object.hasOwnProperty('velocity')
                            ? RequirementType.Required
                            : RequirementType.Forbidden
                    },
                    {
                        name: 'velocity',
                        required: object => !object.hasOwnProperty('power')
                            ? RequirementType.Required
                            : RequirementType.Forbidden
                    }
                )
            })
        });

        let requestData: JsonApiResource;
        try {
            requestData = parser.parse(req.payload).data as JsonApiResource;
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let velocity: number;
        console.log(typeof(requestData.attributes.power))
        if (typeof(requestData.attributes.power) === 'number') {
            velocity = requestData.attributes.power * 10;
        } else {
            velocity = requestData.attributes.velocity;
        }

        console.log('velo', velocity)
        if (velocity === 0) {
            console.log('hello')
            console.log(MotorState.BRAKE)
            this.hedgehog.setMotor(motorPort, MotorState.BRAKE);
        } else {
            this.hedgehog.move(motorPort, velocity);
        }
        return reply('').code(200);
    }
}
