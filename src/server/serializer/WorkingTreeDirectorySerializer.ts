import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import {getLinkUrl} from "../utils";

export default class WorkingTreeDirectorySerializer implements ISerializer {
    public async serialize(directory: WorkingTreeDirectory,
                           request,
                           resourceBuilder,
                           registry): Promise<JsonApiResource> {
        resourceBuilder.resource.type = 'directory';
        resourceBuilder.resource.id = genericToBase64(directory.path);
        resourceBuilder.resource.attributes = {
            mode: directory.mode,
            path: directory.path
        };

        resourceBuilder.addSingleRelationship('parent', {
            related: getLinkUrl(request, `/api/directories/${genericToBase64(directory.getParentPath())}`)
        });

        let items = [];
        for(const item of directory.items) {
            items.push(await registry.serialize(
                await directory.getItem(item),
                request,
                resourceBuilder.documentBuilder.getResourceBuilder()
            ));
        }
        resourceBuilder.addManyRelationship('items', items);

        return resourceBuilder.getProduct();
    }
}
