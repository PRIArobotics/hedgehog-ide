import {Request} from "hapi";

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";
import Version from "../../common/Version";

async function serializeSensor (version: Version,
                                request: Request,
                                documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'hedgehog-version';
    resourceBuilder.resource.id = '0';
    resourceBuilder.resource.attributes = {
        ucId: version.ucId,
        hardwareVersion: version.hardwareVersion,
        firmwareVersion: version.firmwareVersion,
        serverVersion: version.serverVersion
    };

    return resourceBuilder.getProduct();
}
export default serializeSensor;
