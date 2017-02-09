import {
    JsonApiResource, JsonApiLinks, JsonApiDocument, IJsonApiLinkable,
    JsonApiSingleRelationships, JsonApiManyRelationships
} from "./JsonApiObjects";
import {applyMixins} from "../../common/utils";

interface IBuilder<T> {
    getProduct(): T;
}

abstract class LinkBuilder implements IBuilder<IJsonApiLinkable> {
    public abstract getProduct(): IJsonApiLinkable;

    public setLinks(self = '', related = '') {
        if(!this.getProduct().links && (self || related)) {
            this.getProduct().links = new JsonApiLinks();
        } else if (!self && !related) {
            this.getProduct().links = null;
            return;
        }

        if(self) {
            this.getProduct().links.self = self;
        } else if(related) {
            this.getProduct().links.related = related;
        }
    }
}

export default class JsonApiDocumentBuilder implements IBuilder<JsonApiDocument>, LinkBuilder {
    public setLinks: (self, related) => void;

    public document: JsonApiDocument = new JsonApiDocument();

    public setDataType(dataType: DataType) {
        if(dataType === DataType.Many) {
            this.document.data = [];
        } else {
            this.document.data = null;
        }
    }

    public getResourceBuilder() {
        return new JsonApiResourceBuilder(this);
    }

    public addResource(resource: JsonApiResource) {
        if(this.document.data instanceof  Array) {
            this.document.data.push(resource);
        } else {
            this.document.data = resource;
        }
    }

    public addIncludedResource(resource: JsonApiResource) {
        if(!this.document.included)
            this.document.included = [];

        this.document.included.push(resource);
    }

    public getProduct(): JsonApiDocument {
        return this.document;
    }
}
applyMixins(JsonApiDocumentBuilder, [LinkBuilder]);

export class JsonApiResourceBuilder implements IBuilder<JsonApiResource>, LinkBuilder {
    public setLinks: (self, related) => void;

    public resource: JsonApiResource = new JsonApiResource();

    constructor(private documentBuilder: JsonApiDocumentBuilder) { };

    public addSingleRelationship(name: string, relatedResource: JsonApiResource | JsonApiLinks) {
        let relationship = new JsonApiSingleRelationships();

        if(relatedResource instanceof JsonApiResource) {
            relationship.data = relatedResource.getIdentifier();
            this.documentBuilder.addIncludedResource(relatedResource);
        } else {
            relationship.links = relatedResource;
        }
        this.setRelationship(name, relationship);
    }

    public addManyRelationship(name: string, relatedResources: JsonApiResource[] | JsonApiLinks) {
        let relationship = new JsonApiManyRelationships();

        if(relatedResources instanceof Array) {
            relationship.data = relatedResources.map(relatedResource => {
                this.documentBuilder.addIncludedResource(relatedResource);
                return relatedResource.getIdentifier();
            });
        } else {
            relationship.links = relatedResources;
        }
        this.setRelationship(name, relationship);
    }

    public getProduct(): JsonApiResource {
        return this.resource;
    }

    private setRelationship(name: string, relationship: JsonApiSingleRelationships | JsonApiManyRelationships) {
        if(!this.resource.relationships)
            this.resource.relationships = {};
        this.resource.relationships[name] = relationship;
    }
}
applyMixins(JsonApiResourceBuilder, [LinkBuilder]);

export enum DataType {
    Single,
    Many
}
