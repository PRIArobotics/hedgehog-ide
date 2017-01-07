import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";
import SerializerRegistry from "./SerializerRegistry";

async function serializeWorkingTree (workingTree: any,
                                     request: Hapi.Request,
                                     documentBuilder: JsonApiDocumentBuilder,
                                     registry: SerializerRegistry): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'file';
    resourceBuilder.resource.id = genericToBase64(workingTree.programName);
    resourceBuilder.resource.attributes = {
        clean: workingTree.isClean
    };

    const programId = genericToBase64(workingTree.programName);
    resourceBuilder.addSingleRelationship('rootDirectory', {
        related: getLinkUrl(request, `/api/workingtrees/${programId}/directories/${genericToBase64('.')}`)
    });
    return resourceBuilder.getProduct();
}
export default serializeWorkingTree;
