import JsonApiObject from "./JsonApiObject";
import JsonApiLinks from "./JsonApiLinks";
import {JsonApiManyRelationships, JsonApiSingleRelationships} from "./JsonApiRelationships";

export default class JsonApiResource extends JsonApiObject {
    public id: string;
    public readonly type: string;

    public attributes: Object;
    public relationships: {[name: string]: JsonApiSingleRelationships | JsonApiManyRelationships};
    public links: JsonApiLinks;

    public constructor(id, type) {
        super();
        this.id = id;
        this.type = type;
    }
}
