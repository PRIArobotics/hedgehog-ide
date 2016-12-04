import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";

export default class ProgramsResource extends ApiResource {
    constructor(private storagePath: string) {
        super();
    }

    @ApiEndpoint('/programs', 'POST')
    public createProgram(req) {
        console.log(req);
    }
}
