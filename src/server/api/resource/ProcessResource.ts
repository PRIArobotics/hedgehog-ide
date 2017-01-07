import Hapi = require('hapi');

import ApiResource from "../ApiResource";
import SerializerRegistry from "../../serializer/SerializerRegistry";
import ProcessManager from "../../process/ProcessManager";
import ApiEndpoint from "../ApiEndpoint";
import {JsonApiDocument, JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../jsonapi/Parser";
import winston = require("winston");
import {genericFromBase64} from "../../../common/utils";
import JsonApiDocumentBuilder from "../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../utils";

export default class ProcessResource extends ApiResource {
    public constructor (private processManager: ProcessManager, private serializerRegistry: SerializerRegistry) {
        super('/processes');
    }

    @ApiEndpoint('POST')
    public async createProcess (req: Hapi.Request, reply: Hapi.IReply) {
        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties(
                {
                    name: 'id',
                    required: RequirementType.Forbidden
                },
                {
                    name: 'attributes',
                    required: RequirementType.Required,
                    handler: new ObjectParser(() => ({}),
                        {
                            name: 'programId',
                            required: RequirementType.Required
                        },
                        {
                            name: 'fileId',
                            required: RequirementType.Required
                        },
                        {
                            name: 'args'
                        }
                    )
                }
            )
        });

        let requestData: JsonApiResource;
        try {
            requestData = <JsonApiResource> parser.parse(req.payload).data;
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }
        let process = this.processManager.run(
            genericFromBase64(requestData.attributes.programId),
            genericFromBase64(requestData.attributes.fileId),
            requestData.attributes.args || [ ]
        );

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/processes/${process.nodeProcess.pid}`), null);
        documentBuilder.addResource( await this.serializerRegistry.serialize(process, req, documentBuilder));
        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
