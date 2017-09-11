import Hapi = require('hapi');

import {default as JsonApiDocumentBuilder, JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";
import {IProcess} from "../../common/ProcessManager";

function serializeProcess (process: IProcess,
                           request: Hapi.Request,
                           documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    const programId = genericToBase64(process.programName);
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'process';
    resourceBuilder.resource.id = process.pid.toString();
    resourceBuilder.resource.attributes = {
        programId: genericToBase64(process.programName),
        file: process.filePath,
        args: process.args
    };

    resourceBuilder.addSingleRelationship('stdout', {
        related: getLinkUrl(request, `/api/processes/${resourceBuilder.resource.id}/stdout`)
    });
    resourceBuilder.addSingleRelationship('stderr', {
        related: getLinkUrl(request, `/api/processes/${resourceBuilder.resource.id}/stderr`)
    });
    resourceBuilder.addSingleRelationship('stdin', {
        related: getLinkUrl(request, `/api/processes/${resourceBuilder.resource.id}/stdin`)
    });
    resourceBuilder.addSingleRelationship('program', {
        related: getLinkUrl(request, `/api/programs/${programId}`)
    });
    resourceBuilder.addSingleRelationship('file', {
        related: getLinkUrl(request, `/api/files/${programId}/${genericToBase64(process.filePath)}`)
    });

    return Promise.resolve(resourceBuilder.getProduct());
}
export default serializeProcess;
