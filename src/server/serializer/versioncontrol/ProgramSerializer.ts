import {Request} from "hapi";

import {JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {getLinkUrl} from "../../utils";
import {default as JsonApiDocumentBuilder, JsonApiResourceBuilder} from "../../jsonapi/JsonApiBuilder";
import {genericToBase64} from "../../../common/utils";

async function serializeProgram (program: any,
                                 request: Request,
                                 documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let versionIds = await program.getVersionIds();
    let initialVersion = await program.getVersion(versionIds[versionIds.length - 1]);
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'program';
    resourceBuilder.resource.id = genericToBase64(program.name);
    resourceBuilder.resource.attributes = {
        name: program.name,
        creationDate: initialVersion.creationDate.toISOString(),
        latestVersionId: program.latestVersionId,
        workingTreeClean: program.workingTreeClean
    };

    resourceBuilder.addManyRelationship('versions', {
        related: getLinkUrl(request, `/api/versions/${resourceBuilder.resource.id}`)
    });
    resourceBuilder.addSingleRelationship('workingTreeRoot', {
        related: getLinkUrl(request, `/api/directories/${resourceBuilder.resource.id}/${genericToBase64('.')}`)
    });
    resourceBuilder.addSingleRelationship('latestVersion', {
        related: getLinkUrl(request, `/api/versions/${resourceBuilder.resource.id}/${program.latestVersionId}`)
    });

    return resourceBuilder.getProduct();
}
export default serializeProgram;
