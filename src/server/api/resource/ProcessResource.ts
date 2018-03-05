import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../ApiResource";
import SerializerRegistry from "../../serializer/SerializerRegistry";
import ApiEndpoint from "../ApiEndpoint";
import {JsonApiDocument, JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../jsonapi/Parser";
import winston = require("winston");
import {genericFromBase64} from "../../../common/utils";
import JsonApiDocumentBuilder from "../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../utils";
import IProcessManager from "../../../common/ProcessManager";

export default class ProcessResource extends ApiResource {
    public constructor (private processManager: IProcessManager, private serializerRegistry: SerializerRegistry) {
        super('/processes');
    }

    @ApiEndpoint('POST')
    public async createProcess (req: Request, h: ResponseToolkit) {
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
            requestData = parser.parse(req.payload).data as JsonApiResource;
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }
        let process = await this.processManager.run(
            genericFromBase64(requestData.attributes.programId),
            genericFromBase64(requestData.attributes.fileId),
            requestData.attributes.args || [ ]
        );

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/processes/${process.pid}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(process, req, documentBuilder));
        return h.response(documentBuilder.getProduct()).code(201);
    }

    @ApiEndpoint('GET', '/{pid}')
    public async getProcess (req: Request) {
        let process = await this.processManager.getProcess(Number(req.params['pid']));

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/processes/${process.pid}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(process, req, documentBuilder));
        return documentBuilder.getProduct();
    }

    @ApiEndpoint('DELETE', '/{pid}')
    public async killProcess (req: Request, h: ResponseToolkit) {
        await this.processManager.kill(Number(req.params['pid']));

        return h.response().code(204);
    }

    @ApiEndpoint('GET', '/{pid}/stdout')
    public async getStdout (req: Request, h: ResponseToolkit) {
        let output: string;
        try {
            output = await this.processManager.getStdout(Number(req.params['pid']));
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to retrieve process output. The process might not exist or has stopped already.'
            }).code(400);
        }

        return output;
    }

    @ApiEndpoint('GET', '/{pid}/stderr')
    public async getStderr (req: Request, h: ResponseToolkit) {
        let errorStream: string;
        try {
            errorStream = await this.processManager.getStderr(Number(req.params['pid']));
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to retrieve process error stream. The process might not exist or has stopped already.'
            }).code(400);
        }

        return errorStream;
    }

    @ApiEndpoint('PATCH', '/{pid}/stdin')
    public async writeStdin (req: Request, h: ResponseToolkit) {
        try {
            await this.processManager.writeStdin(Number(req.params['pid']), req.payload as string);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to retrieve process error stream. The process might not exist or has stopped already.'
            }).code(400);
        }

        return h.response().code(204);
    }
}
