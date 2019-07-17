import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";
import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import {getLinkUrl} from "../../../utils";
import Emergency from "../../../../common/Emergency";
import {default as JsonApiDocumentBuilder , DataType} from "../../../jsonapi/JsonApiBuilder";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";

export default class EmergencyResource extends ApiResource {

    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/emergency');
    }

    @ApiEndpoint('GET')
    public async getEmergencyState (req: Request) {
        let emergency = new Emergency();

        emergency.active = await this.hedgehog.getEmergencyStop();

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/emergency`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(emergency, req, documentBuilder));
        return documentBuilder.getProduct();
    }

    @ApiEndpoint('PATCH')
    public async setEmergencyState (req: Request, h: ResponseToolkit) {
        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties({
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}), {
                    name: 'activate',
                    required: RequirementType.Required
                })
            })
        });

        let activate: boolean;
        try {
            activate = (parser.parse(req.payload).data as JsonApiResource).attributes.activate;
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }
        await this.hedgehog.setEmergencyStop(activate);
        return this.getEmergencyState(req);
    }
}
