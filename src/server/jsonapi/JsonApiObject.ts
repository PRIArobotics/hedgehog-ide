abstract class JsonApiObject {
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
export default JsonApiObject;
