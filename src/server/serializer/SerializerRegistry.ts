import Hapi = require('hapi');

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";

export default class SerializerRegisty {
    private serializers: Map<string, ISerializer> = new Map();

    public registerSerializer(type: Function, serializer: ISerializer) {
        this.serializers.set(type.name, serializer);
    }

    public async serialize(object, request, resourceBuilder): Promise<JsonApiResource> {
        const type = object.constructor.name;
        if(!this.serializers.has(type))
            throw new Error(`Serializer for type '${type}' not found.`);

        return this.serializers.get(type).serialize(object, request, resourceBuilder);
    }
}

export interface ISerializer {
    serialize(object: any, request: Hapi.Request, resourceBuilder: JsonApiResourceBuilder): Promise<JsonApiResource>;
}