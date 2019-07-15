import {Request} from "hapi";

import {JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../../common/utils";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import {getLinkUrl} from "../../utils";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../../jsonapi/JsonApiBuilder";
import SerializerRegistry from "../SerializerRegistry";

async function serializeWorkingTreeDirectory (directory: WorkingTreeDirectory,
                                              request: Request,
                                              documentBuilder: JsonApiDocumentBuilder,
                                              registry: SerializerRegistry,
                                              includeItems: boolean = true): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'directory';
    resourceBuilder.resource.id = genericToBase64(directory.path);
    resourceBuilder.resource.attributes = {
        mode: directory.mode,
        path: directory.path
    };

    resourceBuilder.addSingleRelationship('parent', {
        related: getLinkUrl(request, `/api/directories/${genericToBase64(directory.getParentPath())}`)
    });

    if(includeItems) {
        let items = [];
        for(const item of directory.items) {
            // Do not include items of subdirectories and file contents
            items.push(await registry.serialize(await directory.getItem(item), request, documentBuilder, false));
        }
        resourceBuilder.addManyRelationship('items', items);
    }

    return resourceBuilder.getProduct();
}
export default serializeWorkingTreeDirectory;
