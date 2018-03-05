import winston = require('winston');
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, RequirementType} from "../../../jsonapi/Parser";
import Program from "../../../../common/versioncontrol/Program";
import {default as JsonApiDocumentBuilder, DataType} from "../../../jsonapi/JsonApiBuilder";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {getRequestUrl, getLinkUrl} from "../../../utils";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";

export default class ProgramResource extends ApiResource {
    private static programParser = JsonApiDocument.getParser().addProperties({
        name: 'data',
        required: RequirementType.Required,
        handler: JsonApiResource.getParser().addProperties(
            {
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}),
                    { name: 'name'},
                    { name: 'latestVersionId'},
                    { name: 'workingTreeClean'},
                    {
                        name: 'copyFrom',
                        required: RequirementType.Forbidden
                    }
                )
            }
        )
    });

    constructor(private programStorage: IProgramStorage,
                private serializerRegistry: SerializerRegistry) {
        super('/programs');
    }

    @ApiEndpoint('POST')
    public async createProgram(req: Request, h: ResponseToolkit) {
        let document: JsonApiDocument;
        try {
            document = ProgramResource.programParser.parse(req.payload, {
                data: {
                    id: RequirementType.Forbidden,
                    attributes: {
                        name: RequirementType.Required,
                        copyFrom: RequirementType.Allowed
                    }
                }
            });
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let attributes = (document.data as JsonApiResource).attributes;
        let program: Program;
        try {
            program = await this.programStorage.createProgram(attributes.name, attributes.copyFrom);
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'An error occurred while creating the program.'
            }).code(500);
        }

        return h.response(await this.replyProgram(program, req)).code(201);
    }

    @ApiEndpoint('GET', '/{programId}')
    public async getProgram(req: Request, h: ResponseToolkit) {
        let program: Program;
        try {
            program = await this.programStorage.getProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Program not found or failed to load'
            }).code(404);
        }

        return this.replyProgram(program , req);
    }

    @ApiEndpoint('GET')
    public async getProgramList(req: Request, h: ResponseToolkit) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getRequestUrl(req), null);
        documentBuilder.setDataType(DataType.Many);

        let programNames: string[];
        try {
            programNames = await this.programStorage.getProgramNames();
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Failed to load program list'
            }).code(500);
        }

        for(const name of programNames) {
            try {
                let program = await this.programStorage.getProgram(name);
                documentBuilder.addResource(await this.serializerRegistry.serialize(program, req, documentBuilder));
            } catch(err) {
                winston.error(err);
            }
        }

        return documentBuilder.getProduct();
    }

    @ApiEndpoint('DELETE', '/{programId}')
    public async deleteProgram(req: Request, h: ResponseToolkit) {
        // TODO implement check whether program exists
        try {
            await this.programStorage.deleteProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'An unknown error occurred while deleting the program'
            }).code(500);
        }
        return h.response().code(204);
    }

    @ApiEndpoint('PATCH', '/{programId}')
    public async updateProgram(req: Request, h: ResponseToolkit) {
        let requestData: JsonApiResource;
        try {
            requestData = ProgramResource.programParser.parse(req.payload).data as JsonApiResource;
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let program: Program;
        try {
            program = await this.programStorage.getProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Program not found or failed to load'
            }).code(404);
        }

        // rename if name changed
        if (requestData.attributes.name && requestData.attributes.name !== program.name) {
            try {
                await program.rename(requestData.attributes.name);
            } catch(err) {
                return h.response({
                    error: 'Failed to rename the program. Program with target name might already exist'
                }).code(400);
            }
        }

        // reset working tree if workingTreeClean has been set to true
        if (requestData.attributes.workingTreeClean && !program.workingTreeClean) {
            try {
                await program.resetWorkingTree();
            } catch(err) {
                return h.response({
                    error: 'Failed to reset the program\'s working tree'
                }).code(500);
            }
        }

        // reset program if latestVersionId changed
        if (requestData.attributes.latestVersionId
            && requestData.attributes.latestVersionId !== program.latestVersionId) {
            try {
                await program.reset(requestData.attributes.latestVersionId);
            } catch (err) {
                return h.response({
                    error: 'Failed to reset the program'
                }).code(500);
            }
        }

        return this.replyProgram(program, req);
    }

    private async replyProgram(program: Program, request) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(request, `/api/programs/${genericToBase64(program.name)}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(program, request, documentBuilder));

        return documentBuilder.getProduct();
    }
}
