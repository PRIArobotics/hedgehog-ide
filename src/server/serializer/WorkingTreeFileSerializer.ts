import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";

export default class WorkingTreeFileSerializer implements ISerializer {

    public async serialize(file: WorkingTreeFile, request, documentBuilder): Promise<JsonApiResource> {
        let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
        resourceBuilder.resource.type = 'file';
        resourceBuilder.resource.id = genericToBase64(file.path);
        resourceBuilder.resource.attributes = {
            path: file.path,
            mode: file.mode,
            content: await file.readContent(),
            encoding: 'utf-8',
            size: file.size
        };

        const programId = genericToBase64(file.programName);
        const directoryId = genericToBase64(file.getParentPath());
        resourceBuilder.addSingleRelationship('directory', {
            related: getLinkUrl(request, `/api/workingtrees/${programId}/directories/${directoryId}`)
        });

        return resourceBuilder.getProduct();
    }

}
