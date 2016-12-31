import Hapi = require('hapi');

import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {getLinkUrl} from "../utils";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";
import {genericToBase64} from "../../common/utils";

export default class ProgramSerializer implements ISerializer {

    public async serialize(program: any,
                           request: Hapi.Request,
                           resourceBuilder: JsonApiResourceBuilder): Promise<JsonApiResource> {
        let versionIds = await program.getVersionIds();
        let initialVersion = await program.getVersion(versionIds[versionIds.length - 1]);

        resourceBuilder.resource.type = 'program';
        resourceBuilder.resource.id = genericToBase64(program.name);
        resourceBuilder.resource.attributes = {
            name: program.name,
            creationDate: initialVersion.creationDate.toISOString()
        };

        resourceBuilder.addManyRelationship('versions', {
            related: getLinkUrl(request, `/api/versions/${resourceBuilder.resource.id}`)
        });
        resourceBuilder.addSingleRelationship('workingtree', {
            related: getLinkUrl(request, `/api/workingtrees/${resourceBuilder.resource.id}`)
        });

        return resourceBuilder.getProduct();
    }
}
