import winston = require('winston');

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, parserHandler} from "../../../jsonapi/Parser";
import Program from "../../../../common/versioncontrol/Program";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import SerializerRegisty from "../../../serializer/SerializerRegistry";
import {DataType} from "../../../jsonapi/JsonApiBuilder";

export default class ProgramsResource extends ApiResource {
    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegisty) {
        super('/programs');
    }

    @ApiEndpoint('POST')
    public async createProgram(req, reply) {
        let resourceParser = JsonApiResource.getParser();
        resourceParser.addProperties({
            name: 'attributes',
            required: true,
            handler: parserHandler(new ObjectParser(() => ({}), {
                name: 'name',
                required: true
            }))
        });

        let document: JsonApiDocument;
        try {
            document = JsonApiDocument.getParser({
                data: resourceParser
            }).parse(req.payload);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while paring the request. Argument might be missing'
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

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(req.url, null);

        reply(await this.serializerRegistry.serialize(program, req, documentBuilder.getResourceBuilder()))
            .code(201);
    }

    @ApiEndpoint('GET', '/{program_id}')
    public async getProgram(req, reply) {
        let program: Program;
        try {
            program = await this.programStorage.getProgram(Program.getNameFromId(req.params['program_id']));
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Program not found or failed to load'
            }).code(400);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(req.url, null);

        return reply(await this.serializerRegistry.serialize(program, req, documentBuilder.getResourceBuilder()))
            .code(200);
    }

    @ApiEndpoint('GET')
    public async getProgramList(req, reply) {
        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(req.url, null);
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
                documentBuilder.addResource(
                    await this.serializerRegistry.serialize(program, req, documentBuilder.getResourceBuilder())
                );
            } catch(err) {
                winston.error(err);
            }
        }

        return reply(documentBuilder.getProduct());
    }
}
