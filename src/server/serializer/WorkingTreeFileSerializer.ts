import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";

export default class WorkingTreeFileSerializer implements ISerializer {

    public async serialize(file: WorkingTreeFile, request, resourceBuilder): Promise<JsonApiResource> {
        resourceBuilder.resource.type = 'file';
        resourceBuilder.resource.id = genericToBase64(file.path);
        resourceBuilder.resource.attributes = {
            path: file.path,
            mode: file.mode,
            content: await file.readContent(),
            encoding: 'utf-8',
            size: file.size
        };

        resourceBuilder.addSingleRelationship('directory', {
            related: getLinkUrl(request, `/api/directory/${genericToBase64(file.getParentPath())}`)
        });

        return resourceBuilder.getProduct();
    }

}
