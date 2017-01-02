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

export default class ProgramsResource extends ApiResource {
    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/programs');
    }

    @ApiEndpoint('POST')
    public async createProgram(req, reply) {
        let document: JsonApiDocument;
        try {
            document = this.parseProgramPayload(req.payload);
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
    public async renameProgram(req, reply) {
        let oldProgramName = genericFromBase64(req.params['programId']);
        let newProgramName: string;
        try {
            newProgramName = (<JsonApiResource> this.parseProgramPayload(req.payload).data).attributes.name;
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        let program: Program;
        try {
            program = await this.programStorage.getProgram(oldProgramName);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Program not found or failed to load'
            }).code(404);
        }

        try {
            await program.rename(newProgramName);
        } catch(err) {
            return reply({
                error: 'Failed to rename the program. Program with target name might already exist'
            }).code(400);
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

    private parseProgramPayload(payload) {
        let resourceParser = JsonApiResource.getParser();
        resourceParser.addProperties(
            {
                name: 'attributes',
                required: RequirementType.Required,
                handler: new ObjectParser(() => ({}), {
                    name: 'name',
                    required: RequirementType.Required
                })
            }
        );

        return JsonApiDocument.getParser({
            data: resourceParser
        }).parse(payload);
    }
}
