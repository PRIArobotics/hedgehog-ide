import {ObjectParser, parserHandler, arrayParserHandler} from "./Parser";

export interface IJsonApiLinkable {
    links: JsonApiLinks;
}

export abstract class JsonApiObject {
    public meta: JsonApiObject;
}

export class JsonApiDocument extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiDocument> {
        let parser = new ObjectParser(() => new JsonApiDocument());

        parser.addProperty({
            name: 'data',
            required: (object) => !object.hasOwnProperty('meta'),
            handler: (property) => {
                let propertyParser = JsonApiResource.getParser();
                if(property instanceof Array) {
                    return propertyParser.parseArray(property);
                } else {
                    return propertyParser.parse(property);
                }
            }
        });
        parser.addProperty({
            name: 'meta',
            required: (object) => {
                return !object.hasOwnProperty('data');
            }
        });
        parser.addProperty({
            name: 'links',
            required: false,
            handler: parserHandler(JsonApiLinks.getParser())
        });
        parser.addProperty({
            name: 'included',
            required: false,
            handler: arrayParserHandler(JsonApiResource.getParser())
        });

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

        parser.addProperty({
            name: 'self',
            required: (object) => !object.hasOwnProperty('related')
        });
        parser.addProperty({
            name: 'related',
            required: (object) => !object.hasOwnProperty('self')
        });

        return parser;
    }

    public self: string;
    public related: string;
}

export class JsonApiResource extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiResource> {
        let parser = new ObjectParser(() => new JsonApiResource());

        parser.addProperty({
            name: 'id',
            required: false
        });
        parser.addProperty({
            name: 'type',
            required: true
        });

        parser.addProperty({
            name: 'attributes',
            required: false
        });
        parser.addProperty({
            name: 'meta',
            required: false
        });
        parser.addProperty({
            name: 'relationships',
            required: false,
            handler: (object) => {
                let manyParser = JsonApiManyRelationships.getParser();
                let singleParser = JsonApiSingleRelationships.getParser();

                let parsedObject = { };
                for(const propertyName of Object.getOwnPropertyNames(object)) {
                    if(object[propertyName].data instanceof Array) {
                        parsedObject[propertyName] = manyParser.parse(object[propertyName]);
                    } else {
                        parsedObject[propertyName] = singleParser.parse(object[propertyName]);
                    }
                }
                return parsedObject;
            }
        });
        parser.addProperty({
            name: 'links',
            required: false,
            handler: parserHandler(JsonApiLinks.getParser())
        });

        return parser;
    }

    public id: string;
    public type: string;

    public attributes: Object;
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

    parser.addProperty({
        name: 'links',
        required: false,
        handler: object => !object.hasOwnProperty('data') && !object.hasOwnProperty('meta')
    });
    parser.addProperty({
        name: 'meta',
        required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('data')
    });

    return parser;
}

export class JsonApiManyRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiManyRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiManyRelationships());

        parser.addProperty({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta'),
            handler: arrayParserHandler(JsonApiResourceIdentifier.getParser())
        });

        return parser;
    }

    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier[];
}

export class JsonApiSingleRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(): ObjectParser<JsonApiSingleRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiSingleRelationships());

        parser.addProperty({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta'),
            handler: parserHandler(JsonApiResourceIdentifier.getParser())
        });

        return parser;
    }

    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier;
}

export class JsonApiResourceIdentifier extends JsonApiObject {
    public static getParser(): ObjectParser<JsonApiResourceIdentifier> {
        let parser = new ObjectParser(() => new JsonApiResourceIdentifier());

        parser.addProperty({
            name: 'id',
            required: true
        });
        parser.addProperty({
            name: 'type',
            required: true
        });

        return parser;
    }

    public id: string;
    public type: string;
}
