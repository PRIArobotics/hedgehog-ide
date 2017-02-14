type Required = RequirementType | ((object: Object, name: string) => RequirementType);

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
     * @param requiredProperties Overrides the default property requirements
     *                           See {@link IParserProperty} for a description of property requirements.
     * @returns {T} Parsed resource
     */
    public parse(object: Object, requiredProperties: {[key: string]: any} = { }): T {
        object = object || { };

        function getRequirementType(required: Required, propertyName: string): RequirementType {
            if(typeof required === 'number' && required in RequirementType) {
                return required;
            } else if(typeof(required) === 'function') {
                return required(object, propertyName);
            } else {
                return RequirementType.Allowed;
            }
        }

        let target = this.targetFactory();
        for(const property of this.properties.values()) {
            const requirementType = requiredProperties[property.name]
                ? getRequirementType(requiredProperties[property.name], property.name)
                : getRequirementType(property.required, property.name);
            if(requirementType === RequirementType.Required && !object.hasOwnProperty(property.name)) {
                throw new Error(`Missing property: ${property.name}`);
            } else if(requirementType === RequirementType.Forbidden && object.hasOwnProperty(property.name)) {
                throw new Error(`Forbidden property: ${property.name}`);
            }

            if(object.hasOwnProperty(property.name)) {
                if(property.handler instanceof ObjectParser) {
                    if(target[property.name] instanceof Array) {
                        target[property.name] = property.handler.parseArray(
                            object[property.name],
                            requiredProperties[property.name] || { }
                        );
                    } else {
                        target[property.name] = property.handler.parse(
                            object[property.name],
                            requiredProperties[property.name] || { }
                        );
                    }
                } else {
                    target[property.name] = property.handler(object[property.name]);
                }
            }
        }
        return target;
    }

    /**
     * Parse an array of same-typed resources at once
     *
     * @param objects array of JSON objects
     * @param requiredProperties Overrides the default property requirements
     *                           See {@link IParserProperty} for a description of property requirements.
     * @returns {T[]} array containing the parsed resources
     */
    public parseArray(objects: Object[], requiredProperties: {[key: string]: any} = { }): T[] {
        let parsedObjects = [];
        for(const object of objects) {
            parsedObjects.push(this.parse(object, requiredProperties));
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
        return this;
    }
}

export enum RequirementType {
    Required,
    Allowed,
    Forbidden
}

/**
 * Represent a parser property.
 *
 * It contains the following properties:
 * - `name`: Name of the property. This is defines the name of the origin as well as on the target object.
 * - `required`: Either a boolean which denoted whether this property is required or a function which gets
 *              called to dynamically decide whether the property is necessary for the current object.
 *              The function gets called with the current JSON object and the property name.
 *              The specified value is a default value and can be overwritten when an object is being parsed.
 * - `handler`: optional; Function for parsing the property of the JSON object.
 *              The property value is supplied as the only function argument.
 *              Defaults to the {@link identityHandler} function which returns the JSON object without modification.
 */
export interface IParserProperty {
    name: string;
    required?: Required;
    handler?: ObjectParser<any> | ((value: any) => any);
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
