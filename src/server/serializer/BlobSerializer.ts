import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import Blob from "../../common/versioncontrol/Blob";
import JsonApiDocumentBuilder from "../jsonapi/JsonApiBuilder";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";

async function serializeBlob (blob: Blob,
                              request: Hapi.Request,
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