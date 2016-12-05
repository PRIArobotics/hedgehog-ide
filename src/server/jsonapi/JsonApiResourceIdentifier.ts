import JsonApiObject from "./JsonApiObject";

export default class JsonApiResourceIdentifier extends JsonApiObject {
    public id: string;
    public readonly type: string;

    public constructor(id, type) {
        super();
        this.id = id;
        this.type = type;
    }
}
