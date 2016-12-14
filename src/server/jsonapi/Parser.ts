export class ObjectParser<T> {
    private properties: IParserProperty[] = [];

    public constructor(public targetFactory: () => T) { };

    public parse(object: Object): T {
        let target = this.targetFactory();
        for(const property of this.properties) {
            if(object[property.name]) {
                target[property.name] = property.handler(object[property.name]);
            } else if((typeof(property.required) === 'function' && property.required(object, property.name))
                      || property.required) {
                throw new Error(`Missing property: ${property.name}`);
            }
        }
        return target;
    }

    public parseArray(objects: Object[]): T[] {
        let parsedObjects = [];
        for(const object of objects) {
            parsedObjects.push(this.parse(object));
        }
        return parsedObjects;
    }

    public addProperty(property: IParserProperty) {
        if(!property.handler)
            property.handler = identityHandler;

        this.properties.push(property);
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
