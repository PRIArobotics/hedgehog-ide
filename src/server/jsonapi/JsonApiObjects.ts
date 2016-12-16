import {ObjectParser, parserHandler, arrayParserHandler, IParserProperty} from "./Parser";

export interface IJsonApiLinkable {
    links: JsonApiLinks;
}

export abstract class JsonApiObject {
    public meta: JsonApiObject;
}

export class JsonApiDocument extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(
        overwriteSubParser: {[key: string]: ObjectParser<JsonApiObject>} = { }
    ): ObjectParser<JsonApiDocument> {
        let parser = new ObjectParser(() => new JsonApiDocument());
        let subParsers = Object.assign({
            data: JsonApiResource.getParser(),
            included: JsonApiResource.getParser()
        }, overwriteSubParser);

        parser.addProperties(
            {
                name: 'data',
                required: (object) => !object.hasOwnProperty('meta'),
                handler: (property) => {
                    let propertyParser = subParsers['data'];
                    if(property instanceof Array) {
                        return propertyParser.parseArray(property);
                    } else {
                        return propertyParser.parse(property);
                    }
                }
            },
            {
                name: 'meta',
                required: (object) => {
                    return !object.hasOwnProperty('data');
                }
            },
            {
                name: 'links',
                required: false,
                handler: parserHandler(JsonApiLinks.getParser())
            },
            {
                name: 'included',
                required: false,
                handler: arrayParserHandler(subParsers['included'])
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
                required: (object) => !object.hasOwnProperty('related')
            },
            {
                name: 'related',
                required: (object) => !object.hasOwnProperty('self')
            }
        );

        return parser;
    }

    public self: string;
    public related: string;
}

export class JsonApiResource extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(
        overwriteSubParser: {[key: string]: ObjectParser<JsonApiObject>} = { }
    ): ObjectParser<JsonApiResource> {
        let parser = new ObjectParser(() => new JsonApiResource());
        let subParsers = Object.assign({
            relationships: {
                many: JsonApiManyRelationships.getParser(),
                single: JsonApiSingleRelationships.getParser()
            },
        }, overwriteSubParser);

        parser.addProperties(
            {
                name: 'id',
                    required: false
            },
            {
                name: 'type',
                    required: true
            },
            {
                name: 'attributes',
                required: false
            },
            {
                name: 'meta',
                required: false
            },
            {
                name: 'relationships',
                required: false,
                handler: (object) => {
                    let manyParser = subParsers['relationships']['many'];
                    let singleParser = subParsers['relationships']['single'];

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
            },
            {
                name: 'links',
                required: false,
                handler: parserHandler(JsonApiLinks.getParser())
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
            required: false,
            handler: object => !object.hasOwnProperty('data') && !object.hasOwnProperty('meta')
        },
        {
            name: 'meta',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('data')
        }
    );

    return parser;
}

export class JsonApiManyRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(
        overwriteSubParser: {[key: string]: ObjectParser<JsonApiObject>} = { }
    ): ObjectParser<JsonApiManyRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiManyRelationships());
        let subParsers = Object.assign({
            data: JsonApiResourceIdentifier.getParser()
        }, overwriteSubParser);

        parser.addProperties({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta'),
            handler: arrayParserHandler(subParsers['data'])
        });

        return parser;
    }

    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier[];
}

export class JsonApiSingleRelationships extends JsonApiObject implements IJsonApiLinkable {
    public static getParser(
        overwriteSubParser: {[key: string]: ObjectParser<JsonApiObject>} = { }
    ): ObjectParser<JsonApiSingleRelationships> {
        let parser = getRelationshipBaseParser(() => new JsonApiSingleRelationships());
        let subParsers = Object.assign({
            data: JsonApiResourceIdentifier.getParser()
        }, overwriteSubParser);

        parser.addProperties({
            name: 'data',
            required: object => !object.hasOwnProperty('links') && !object.hasOwnProperty('meta'),
            handler: parserHandler(subParsers['data'])
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
                required: true
            },
            {
                name: 'type',
                required: true
            }
        );
        return parser;
    }

    public id: string;
    public type: string;
}
