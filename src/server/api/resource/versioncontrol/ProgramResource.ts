import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, parserHandler} from "../../../jsonapi/Parser";
import Program from "../../../../common/versioncontrol/Program";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";

export default class ProgramsResource extends ApiResource {
    constructor(private programStorage: IProgramStorage) {
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
            return reply({
                error: 'Error while paring the request. Argument might be missing'
            }).code(400);
        }

        let program: Program;
        try {
            program = await this.programStorage.createProgram((<JsonApiResource>document.data).attributes.name);
        } catch(err) {
            return reply({
                error: 'An error occurred while creating the program.'
            }).code(500);
        }

        let initialVersion = await program.getVersion(program.latestVersionId);

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(req.url, null);

        let resourceBuilder = documentBuilder.getResourceBuilder();
        resourceBuilder.resource.type = 'program';
        resourceBuilder.resource.id = new Buffer(program.name).toString('base64');
        resourceBuilder.resource.attributes = {
            name: program.name,
            creationDate: initialVersion.creationDate.toISOString()
        };

        // TODO: add relationships

        return reply(resourceBuilder.getProduct())
            .code(201);
    }
}
