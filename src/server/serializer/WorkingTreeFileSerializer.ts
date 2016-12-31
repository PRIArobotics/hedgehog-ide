import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64, basename} from "../../common/utils";
import {getLinkUrl} from "../utils";

export default class WorkingTreeFileSerializer implements ISerializer {

    public async serialize(file: any, request, resourceBuilder): Promise<JsonApiResource> {
        resourceBuilder.resource.type = 'file';
        resourceBuilder.resource.id = genericToBase64(file.path);
        resourceBuilder.resource.attributes = {
            path: file.path,
            mode: file.mode,
            content: await file.readContent(),
            encoding: 'utf-8',
            size: file.size
        };

        resourceBuilder.addSingleRelationship('workingtree', {
            related: getLinkUrl(request, `/api/directory/${genericToBase64(basename(file.path))}`)
        });

        return resourceBuilder.getProduct();
    }

}
