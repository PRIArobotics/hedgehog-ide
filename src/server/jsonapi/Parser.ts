/**
 * The ObjectParser is used both for validation and parsing JSON (request) data
 * into the resource model class instances.
 *
 * Each parser instance has properties which define the properties on the target model.
 *
 * One parser is always responsible for exactly one type of objects which is specified
 * with the type argument `T`.
 */
export class ObjectParser<T> {
    private properties: Map<string, IParserProperty> = new Map();

    /**
     * Create a ObjectParser
     *
     * @param targetFactory Method which is used to create resource model instances
     * @param properties Rest argument for adding properties directly on the parser creation
     */
    public constructor(public targetFactory: () => T, ...properties: IParserProperty[]) {
        if(properties)
            this.addProperties.apply(this, properties);
    };

    /**
     * Parse a single resource
     *
     * @param object Deserialized JSON data
     * @returns {T} Parsed resource
     */
    public parse(object: Object): T {
        object = object || { };

        let target = this.targetFactory();
        for(const property of this.properties.values()) {
            if(object[property.name]) {
                target[property.name] = property.handler(object[property.name]);
            } else if((typeof(property.required) === 'function' && property.required(object, property.name))
                   || (typeof(property.required) === 'boolean' && property.required)) {
                throw new Error(`Missing property: ${property.name}`);
            }
        }
        return target;
    }

    /**
     * Parse an array of same-typed resources at once
     *
     * @param objects array of JSON objects
     * @returns {T[]} array containing the parsed resources
     */
    public parseArray(objects: Object[]): T[] {
        let parsedObjects = [];
        for(const object of objects) {
            parsedObjects.push(this.parse(object));
        }
        return parsedObjects;
    }

    /**
     * Add one or more properties to the parser.
     * Existing properties will be overwritten.
     *
     * @param properties Rest argument; properties to add (see {@link IParserProperty})
     */
    public addProperties(...properties: IParserProperty[]) {
        for(const property of properties) {
            if(!property.handler)
                property.handler = identityHandler;

            this.properties.set(property.name, property);
        }
    }
}

export interface IParserProperty {
    name: string;
    required: boolean | ((object: Object, name: string) => boolean);
    handler?: (value: any) => any;
}

export function identityHandler(value: any) {
    return value;
}

export function parserHandler<T>(parser: ObjectParser<T>) {
    return (value: Object) => {
        return parser.parse(value);
    };
}

export function arrayParserHandler<T>(parser: ObjectParser<T>) {
    return (values: Object[]) => {
        return parser.parseArray(values);
    };
}
