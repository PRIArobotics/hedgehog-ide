import JsonApiObject from "./JsonApiObject";
import JsonApiResource from "./JsonApiResource";
import JsonApiLinks from "./JsonApiLinks";

export default class JsonApiDocument extends JsonApiObject {
    public static readonly jsonapi = {
        version: '1.0'
    };

    public data: JsonApiResource;
    public included: JsonApiResource[];
    public links: JsonApiLinks;
}
