import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";

export default class SerializerRegistry {
    private serializers: Map<string, ISerializer> = new Map();

    public registerSerializer(type: Function, serializer: ISerializer) {
        this.serializers.set(type.name, serializer);
    }

    public async serialize(object, request, resourceBuilder): Promise<JsonApiResource> {
        const type = object.constructor.name;
        if(!this.serializers.has(type))
            throw new Error(`Serializer for type '${type}' not found.`);

        return this.serializers.get(type).serialize(object, request, resourceBuilder, this);
    }
}

export interface ISerializer {
    serialize(object: any,
              request: Hapi.Request,
              documentBuilder: JsonApiDocumentBuilder,
              registry?: SerializerRegistry): Promise<JsonApiResource>;
}
