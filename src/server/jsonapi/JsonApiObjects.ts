export interface IJsonApiLinkable {
    links: JsonApiLinks;
}

export abstract class JsonApiObject {
    public meta: JsonApiObject;
}

export class JsonApiDocument extends JsonApiObject implements IJsonApiLinkable {
    public readonly jsonapi = {
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
