import {ObjectParser, RequirementType} from "./Parser";

export interface IJsonApiLinkable {
    links: JsonApiLinks;
}

export abstract class JsonApiObject {
    public meta?: JsonApiObject;
}

export class JsonApiDocument extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiDocument> {
        let parser = new ObjectParser(() => new JsonApiDocument(),
            {
                name: 'data',
                required: object => !object.hasOwnProperty('meta')
                    ? RequirementType.Required
                    : RequirementType.Allowed,
            },
            {
                name: 'meta',
                required: object => !object.hasOwnProperty('data')
                    ? RequirementType.Required
                    : RequirementType.Allowed,
            },
            {
                name: 'links',
                handler: JsonApiLinks.getParser()
            },
            {
                name: 'included',
            }
        );
        return parser;
    }

    public readonly jsonapi = {
        version: '1.0'
    };

    public data: JsonApiResource | JsonApiResource[];
    public included: JsonApiResource[];
    public links: JsonApiLinks;
}

export class JsonApiLinks extends JsonApiObject {
    public static getParser(): ObjectParser<JsonApiLinks> {
        let parser = new ObjectParser(() => new JsonApiLinks());
        parser.addProperties(
            {
                name: 'self',
                required: object => !object.hasOwnProperty('related')
                    ? RequirementType.Required
                    : RequirementType.Allowed,
            },
            {
                name: 'related',
                required: object => !object.hasOwnProperty('self')
                    ? RequirementType.Required
                    : RequirementType.Allowed,
            }
        );

        return parser;
    }

    public self?: string;
    public related?: string;
}

export class JsonApiResource extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiResource> {
        let parser = new ObjectParser(() => new JsonApiResource());

        parser.addProperties(
            {
                name: 'id',
                required: RequirementType.Required
            },
            {
                name: 'type',
                required: RequirementType.Required
            },
            { name: 'attributes' },
            { name: 'meta' },
            { name: 'relationships' },
            {
                name: 'links',
                handler: JsonApiLinks.getParser()
            }
        );

        return parser;
    }

    public id: string;
    public type: string;

    public attributes: any;
    public relationships: {[name: string]: JsonApiSingleRelationships | JsonApiManyRelationships};
    public links: JsonApiLinks;

    public getIdentifier() {
        let identifier = new JsonApiResourceIdentifier();
        identifier.id = this.id;
        identifier.type = this.type;
        return identifier;
    }
}

function getRelationshipBaseParser<T>(factory: () => T): ObjectParser<T> {
    let parser = new ObjectParser(factory);

    parser.addProperties(
        {
            name: 'links',
            handler: object => !object.hasOwnProperty('data') && !object.hasOwnProperty('meta')
        },
        {
            name: 'meta',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('data')
                ? RequirementType.Required
                : RequirementType.Allowed
        }
    );

    return parser;
}

export class JsonApiManyRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiManyRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiManyRelationships());

        parser.addProperties({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta')
                ? RequirementType.Required
                : RequirementType.Allowed
        });

        return parser;
    }

    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier[];
}

export class JsonApiSingleRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiSingleRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiSingleRelationships());

        parser.addProperties({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta')
                ? RequirementType.Required
                : RequirementType.Allowed
        });

        return parser;
    }

    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier;
}

export class JsonApiResourceIdentifier extends JsonApiObject {
    public static getParser(): ObjectParser<JsonApiResourceIdentifier> {
        let parser = new ObjectParser(() => new JsonApiResourceIdentifier());
        parser.addProperties(
            {
                name: 'id',
                required: RequirementType.Required
            },
            {
                name: 'type',
                required: RequirementType.Required
            }
        );
        return parser;
    }

    public id: string;
    public type: string;
}
