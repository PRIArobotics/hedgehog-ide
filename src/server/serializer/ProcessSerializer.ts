import Hapi = require('hapi');

import {Process} from "../process/ProcessManager";
import JsonApiDocumentBuilder from "../jsonapi/JsonApiBuilder";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";
import {genericToBase64} from "../../common/utils";
import {getLinkUrl} from "../utils";

function serializeProcess (process: Process,
                           request: Hapi.Request,
                           documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    const programId = genericToBase64(process.programName);
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'program';
    resourceBuilder.resource.id = process.nodeProcess.pid.toString();
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
