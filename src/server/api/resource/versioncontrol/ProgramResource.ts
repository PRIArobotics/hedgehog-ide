import winston = require('winston');

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, RequirementType} from "../../../jsonapi/Parser";
import Program from "../../../../common/versioncontrol/Program";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {DataType} from "../../../jsonapi/JsonApiBuilder";
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
                )
            }
        )
    });

    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/programs');
    }

    @ApiEndpoint('POST')
    public async createProgram(req, reply) {
        let document: JsonApiDocument;
        try {
            document = ProgramResource.programParser.parse(req.payload, {
                data: {
                    id: RequirementType.Forbidden,
                    attributes: {
                        name: RequirementType.Required
                    }
                }
            });
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let program: Program;
        try {
            program = await this.programStorage.createProgram((<JsonApiResource>document.data).attributes.name);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'An error occurred while creating the program.'
            }).code(500);
        }

        return (await this.replyProgram(program, req, reply))
            .code(201);
    }

    @ApiEndpoint('GET', '/{programId}')
    public async getProgram(req, reply) {
        let program: Program;
        try {
            program = await this.programStorage.getProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Program not found or failed to load'
            }).code(404);
        }

        return await this.replyProgram(program , req, reply);
    }

    @ApiEndpoint('GET')
    public async getProgramList(req, reply) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getRequestUrl(req), null);
        documentBuilder.setDataType(DataType.Many);

        let programNames: string[];
        try {
            programNames = await this.programStorage.getProgramNames();
        } catch(err) {
            winston.error(err);
            return reply({
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

        return reply(documentBuilder.getProduct());
    }

    @ApiEndpoint('DELETE', '/{programId}')
    public async deleteProgram(req, reply) {
        // TODO implement check whether program exists
        try {
            await this.programStorage.deleteProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Un unknown error occurred while deleting the program'
            }).code(500);
        }
        return reply().code(204);
    }

    @ApiEndpoint('PATCH', '/{programId}')
    public async updateProgram(req, reply) {
        let requestData: JsonApiResource;
        try {
            requestData = (<JsonApiResource> ProgramResource.programParser.parse(req.payload).data);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let program: Program;
        try {
            program = await this.programStorage.getProgram(genericFromBase64(req.params['programId']));
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Program not found or failed to load'
            }).code(404);
        }

        // rename if name changed
        if (requestData.attributes.name && requestData.attributes.name !== program.name) {
            try {
                await program.rename(requestData.attributes.name);
            } catch(err) {
                return reply({
                    error: 'Failed to rename the program. Program with target name might already exist'
                }).code(400);
            }
        }

        // reset working tree if workingTreeClean has been set to true
        if (requestData.attributes.workingTreeClean && !program.workingTreeClean) {
            try {
                await program.resetWorkingTree();
            } catch(err) {
                return reply({
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
                return reply({
                    error: 'Failed to reset the program'
                }).code(500);
            }
        }

        return this.replyProgram(program, req, reply);
    }

    private async replyProgram(program: Program, request, reply) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(request, `/api/programs/${genericToBase64(program.name)}`), null);
        documentBuilder.addResource( await this.serializerRegistry.serialize(program, request, documentBuilder));

        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
