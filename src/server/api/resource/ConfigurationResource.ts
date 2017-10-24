import ApiResource from "../ApiResource";
import ApiEndpoint from "../ApiEndpoint";
import * as Hapi from "hapi";
import JsonApiDocumentBuilder from "../../jsonapi/JsonApiBuilder";

export default class ConfigurationResource extends ApiResource {
    public constructor (private serverConfig) {
        super('/config');
    }

    @ApiEndpoint('GET')
    public async getConfiguration (req: Hapi.Request, reply: Hapi.IReply) {
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
