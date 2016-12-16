import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, parserHandler} from "../../../jsonapi/Parser";

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

        let document = JsonApiDocument.getParser({
            data: resourceParser
        }).parse(req.payload);
        console.log(document);

        await this.programStorage.createProgram((<JsonApiResource>document.data).attributes.name);

        reply(200);
    }
}
