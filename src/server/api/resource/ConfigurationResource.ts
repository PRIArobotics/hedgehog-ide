import {ReplyNoContinue, Request} from "hapi";

import ApiResource from "../ApiResource";
import ApiEndpoint from "../ApiEndpoint";
import JsonApiDocumentBuilder from "../../jsonapi/JsonApiBuilder";

export default class ConfigurationResource extends ApiResource {
    public constructor (private serverConfig) {
        super('/config');
    }

    @ApiEndpoint('GET')
    public async getConfiguration (req: Request, reply: ReplyNoContinue) {
        let documentBuilder = new JsonApiDocumentBuilder();
        let resourceBuilder = documentBuilder.getResourceBuilder();
        resourceBuilder.resource.type = 'configuration';
        resourceBuilder.resource.attributes = {
            auth: {
                enabled: this.serverConfig.auth.enabled
            }
        };
        documentBuilder.addResource(resourceBuilder.getProduct());
        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
