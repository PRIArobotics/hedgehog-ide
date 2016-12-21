import Hapi = require('hapi');

import {ISerializer} from "./SerializerRegistry";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {getLinkUrl} from "../utils";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";

export default class ProgramSerializer implements ISerializer {

    public async serialize(program: any,
                           request: Hapi.Request,
                           resourceBuilder: JsonApiResourceBuilder): Promise<JsonApiResource> {
        let versionIds = await program.getVersionIds();
        let initialVersion = await program.getVersion(versionIds[versionIds.length - 1]);

        resourceBuilder.resource.type = 'program';
        resourceBuilder.resource.id = program.getId();
        resourceBuilder.resource.attributes = {
            name: program.name,
            creationDate: initialVersion.creationDate.toISOString()
        };

        resourceBuilder.addManyRelationship('versions', {
            related: getLinkUrl(request, `/api/versions/${program.getId()}`)
        });
        resourceBuilder.addSingleRelationship('workingtree', {
            related: getLinkUrl(request, `/api/workingtrees/${program.getId()}`)
        });

        return resourceBuilder.getProduct();
    }
}
