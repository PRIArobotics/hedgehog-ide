import JsonApiObject from "./JsonApiObject";
import JsonApiLinks from "./JsonApiLinks";
import JsonApiResourceIdentifier from "./JsonApiResourceIdentifier";

export class JsonApiManyRelationships extends JsonApiObject {
    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier[];
}

export class JsonApiSingleRelationships extends JsonApiObject {
    public links: JsonApiLinks;
    public data: JsonApiResourceIdentifier;
}
