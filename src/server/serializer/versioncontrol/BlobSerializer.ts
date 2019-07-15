import {Request} from "hapi";

import {JsonApiResource} from "../../jsonapi/JsonApiObjects";
import Blob from "../../../common/versioncontrol/Blob";
import {default as JsonApiDocumentBuilder, JsonApiResourceBuilder} from "../../jsonapi/JsonApiBuilder";

async function serializeBlob (blob: Blob,
                              request: Request,
                              documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let content = await blob.readContent();

    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'blob';
    resourceBuilder.resource.id = blob.id;
    resourceBuilder.resource.attributes = {
        content,
        encoding: 'utf-8',
        size: content.length
    };
    return resourceBuilder.getProduct();
}
export default serializeBlob;
