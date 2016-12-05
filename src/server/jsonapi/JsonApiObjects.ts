export interface IJsonApiLinkable {
    links: JsonApiLinks;
}

export abstract class JsonApiObject {
    public meta: JsonApiObject;

    public toJson(): Object {
        function serializeProperty(property: any) {
            if(property instanceof JsonApiObject) {
                return property.toJson();
            } else if(property instanceof Array) {
                return property.map((item) => {
                    return serializeProperty(item);
                });
            } else if(typeof(property) !== 'object' && typeof(property) !== 'function') {
                return property;
            }
            return null;
        }

        let json = { };
        for(const key in this) {
            if(!this.hasOwnProperty(key))
                continue;

            let serialized = serializeProperty(this[key]);
            if(serialized)
                json[key] = serialized;
        }
        return json;
    };
}

export class JsonApiDocument extends JsonApiObject implements IJsonApiLinkable {
    public static readonly jsonapi = {
        version: '1.0'
    };

    public data: JsonApiResource | JsonApiResource[];
    public included: JsonApiResource[];
    public links: JsonApiLinks;
}

export class JsonApiLinks extends JsonApiObject {
    public self: string;
    public related: string;
}

export class JsonApiResource extends JsonApiObject implements IJsonApiLinkable {
    public id: string;
    public type: string;

    public attributes: Object;
    public relationships: {[name: string]: JsonApiSingleRelationships | JsonApiManyRelationships};
    public links: JsonApiLinks;

    public getIdentifier() {
        return new JsonApiResourceIdentifier(this.id, this.type);
    }
}

export class JsonApiManyRelationships extends JsonApiObject implements IJsonApiLinkable {
    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier[];
}

export class JsonApiSingleRelationships extends JsonApiObject implements IJsonApiLinkable {
    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier;
}

export class JsonApiResourceIdentifier extends JsonApiObject {
    public id: string;
    public type: string;

    public constructor(id, type) {
        super();
        this.id = id;
        this.type = type;
    }
}
