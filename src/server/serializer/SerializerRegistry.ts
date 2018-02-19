import {Request} from "hapi";

import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import JsonApiDocumentBuilder from "../jsonapi/JsonApiBuilder";

export default class SerializerRegistry {
    private serializers: Map<string, ISerializer> = new Map();

    public registerSerializer(type: Function, serializer: ISerializer) {
        this.serializers.set(type.name, serializer);
    }

    public async serialize(object, request, documentBuilder, ...args): Promise<JsonApiResource> {
        const type = object.constructor.name;
        if(!this.serializers.has(type))
            throw new Error(`Serializer for type '${type}' not found.`);

        return this.serializers.get(type)(object, request, documentBuilder, this, ...args);
    }
}

export interface ISerializer {
    (object: any,
     request: Request,
     documentBuilder: JsonApiDocumentBuilder,
     registry?: SerializerRegistry,
     ...args): Promise<JsonApiResource>;
}
