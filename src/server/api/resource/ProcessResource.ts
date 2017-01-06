import Hapi = require('hapi');

import ApiResource from "../ApiResource";
import SerializerRegistry from "../../serializer/SerializerRegistry";
import ProcessManager from "../../process/ProcessManager";
import ApiEndpoint from "../ApiEndpoint";

export default class ProcessResource extends ApiResource {
    public constructor (private processManager: ProcessManager, private serializerRegistry: SerializerRegistry) {
        super('/processes');
    }

    @ApiEndpoint('POST')
    public createProcess(req: Hapi.Request, reply: Hapi.IReply) {
        this.processManager.run(req.payload['programName'], req.payload['filePath']);
        return reply('')
            .code(200);
    }
}
