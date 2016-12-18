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

/**
 * Represent a parser property.
 *
 * It contains the following properties:
 * - `name`: Name of the property. This is defines the name of the origin as well as on the target object.
 * - `require`: Either a boolean which denoted whether this property is required or a function which gets
 *              called to dynamically decide whether the property is necessary for the current object.
 *              The function gets called with the current JSON object and the property name.
 * - `handler`: optional; Function for parsing the property of the JSON object.
 *              The property value is supplied as the only function argument.
 *              Defaults to the {@link identityHandler} function which returns the JSON object without modification.
 */
export interface IParserProperty {
    name: string;
    required: boolean | ((object: Object, name: string) => boolean);
    handler?: (value: any) => any;
}

/**
 * Handler function which returns the JSON property without any modifications.
 * This is also the default property handler.
 *
 * @param value Property value
 * @returns {any} Unmodified property value
 */
export function identityHandler(value: any) {
    return value;
}

/**
 * Handler which parses the property value using the specified {@link ObjectParser}.
 * This is a higher order function and returns the actual parser function which can be passed to the parser.
 *
 * @param parser Parser instance
 * @returns {(value:Object)=>T} Handler function
 */
export function parserHandler<T>(parser: ObjectParser<T>) {
    return (value: Object) => {
        return parser.parse(value);
    };
}

/**
 * Same as {@link parserHandler} but for handling an array of objects.
 *
 * @param parser Parser instance
 * @returns {(values:Object[])=>T[]} Handler function
 */
export function arrayParserHandler<T>(parser: ObjectParser<T>) {
    return (values: Object[]) => {
        return parser.parseArray(values);
    };
}
