import {Request} from "hapi";

import Version from "../../../common/versioncontrol/Version";
import {default as JsonApiDocumentBuilder, JsonApiResourceBuilder} from "../../jsonapi/JsonApiBuilder";
import {JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../../common/utils";
import {getLinkUrl} from "../../utils";

function serializeVersion (version: Version,
                           request: Request,
                           documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    const programId = genericToBase64(version.programName);
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'version';
    resourceBuilder.resource.id = version.id;
    resourceBuilder.resource.attributes = {
        tag: version.tag,
        message: version.message,
        programId,
        treeId: version.treeId,
        parentIds: version.parentIds
    };

    resourceBuilder.addSingleRelationship('tree', {
        related: getLinkUrl(request, `/api/trees/${programId}/${version.treeId}`)
    });
    resourceBuilder.addSingleRelationship('program', {
        related: getLinkUrl(request, `/api/programs/${programId}`)
    });
    resourceBuilder.addSingleRelationship('parents', {
        related: getLinkUrl(request, `/api/versions/${programId}/${version.id}/parents`)
    });

    return Promise.resolve(resourceBuilder.getProduct());
}
export default serializeVersion;
