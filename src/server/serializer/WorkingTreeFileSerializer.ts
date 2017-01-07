import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";

async function serializeWorkingTreeFile (file: WorkingTreeFile,
                                         request: Hapi.Request,
                                         documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
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
        related: getLinkUrl(request, `/api/directories/${programId}/${directoryId}`)
    });

    return resourceBuilder.getProduct();
}
export default serializeWorkingTreeFile;
