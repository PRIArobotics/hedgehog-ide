import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {getLinkUrl} from "../utils";
import {default as JsonApiDocumentBuilder, JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";
import {genericToBase64} from "../../common/utils";

async function serializeProgram (program: any,
                                 request: Hapi.Request,
                                 documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let versionIds = await program.getVersionIds();
    let initialVersion = await program.getVersion(versionIds[versionIds.length - 1]);
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'program';
    resourceBuilder.resource.id = genericToBase64(program.name);
    resourceBuilder.resource.attributes = {
        name: program.name,
        creationDate: initialVersion.creationDate.toISOString()
    };

    resourceBuilder.addManyRelationship('versions', {
        related: getLinkUrl(request, `/api/versions/${resourceBuilder.resource.id}`)
    });
    resourceBuilder.addSingleRelationship('workingtree', {
        related: getLinkUrl(request, `/api/workingtrees/${resourceBuilder.resource.id}`)
    });

    return resourceBuilder.getProduct();
}
export default serializeProgram;
