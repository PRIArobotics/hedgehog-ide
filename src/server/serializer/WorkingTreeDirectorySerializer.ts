import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource, JsonApiResourceIdentifier} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import {getLinkUrl} from "../utils";
import {WorkingTreeObjectType} from "../../common/versioncontrol/WorkingTreeObject";

export default class WorkingTreeDirectorySerializer implements ISerializer {
    public async serialize(directory: WorkingTreeDirectory, request, resourceBuilder): Promise<JsonApiResource> {
        resourceBuilder.resource.type = 'directory';
        resourceBuilder.resource.id = genericToBase64(directory.path);
        resourceBuilder.resource.attributes = {
            mode: directory.mode,
            path: directory.path
        };

        resourceBuilder.addSingleRelationship('parent', {
            related: getLinkUrl(request, `/api/directory/${genericToBase64(directory.getParentPath())}`)
        });
        resourceBuilder.addManyRelationship('items', await directory.items.map((item) => {
            let resource = new JsonApiResourceIdentifier();
            resource.id = genericToBase64(directory.getItemPath(item));
            resource.type = directory.getItemType(item) === WorkingTreeObjectType.File ? 'file' : 'directory';
            return resource;
        }));

        return Promise.resolve(resourceBuilder.getProduct());
    }
}
