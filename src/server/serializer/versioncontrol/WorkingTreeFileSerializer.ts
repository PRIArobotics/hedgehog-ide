import {Request} from "hapi";

import {JsonApiResource} from "../../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../../common/utils";
import {getLinkUrl} from "../../utils";
import WorkingTreeFile from "../../../common/versioncontrol/WorkingTreeFile";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../../jsonapi/JsonApiBuilder";
import SerializerRegistry from "../SerializerRegistry";

async function serializeWorkingTreeFile (file: WorkingTreeFile,
                                         request: Request,
                                         documentBuilder: JsonApiDocumentBuilder,
                                         registry: SerializerRegistry,
                                         includeContent: boolean = true): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'file';
    resourceBuilder.resource.id = genericToBase64(file.path);
    resourceBuilder.resource.attributes = {
        path: file.path,
        mode: file.mode,
        encoding: 'utf-8',
        size: file.size
    };

    if (includeContent)
        resourceBuilder.resource.attributes.content = await file.readContent();

    const programId = genericToBase64(file.programName);
    const directoryId = genericToBase64(file.getParentPath());
    resourceBuilder.addSingleRelationship('directory', {
        related: getLinkUrl(request, `/api/directories/${programId}/${directoryId}`)
    });

    return resourceBuilder.getProduct();
}
export default serializeWorkingTreeFile;
