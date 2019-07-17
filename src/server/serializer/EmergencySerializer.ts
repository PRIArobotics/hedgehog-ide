import {Request} from "hapi";

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";
import Emergency from "../../common/Emergency";

async function serializeEmergency (emergency: Emergency,
                                request: Request,
                                documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'emergency';
    resourceBuilder.resource.id = '0';
    resourceBuilder.resource.attributes = {
        active: emergency.active
    };

    return resourceBuilder.getProduct();
}
export default serializeEmergency;
