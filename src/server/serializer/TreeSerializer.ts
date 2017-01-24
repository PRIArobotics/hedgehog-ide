import Hapi = require('hapi');

import Tree from "../../common/versioncontrol/Tree";
import JsonApiDocumentBuilder from "../jsonapi/JsonApiBuilder";
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder} from "../jsonapi/JsonApiBuilder";
import {TreeItemType} from "../../common/versioncontrol/Tree";
import {getLinkUrl} from "../utils";

function serializeTree (tree: Tree,
                        request: Hapi.Request,
                        documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'tree';
    resourceBuilder.resource.id = tree.id;

    let items = [ ];
    for (let [path, item] of tree.items.entries()) {
        let itemResourceBuilder = new JsonApiResourceBuilder(documentBuilder);
        itemResourceBuilder.resource.type = 'tree-item';
        itemResourceBuilder.resource.id = item.id;
        itemResourceBuilder.resource.attributes = {
            path,
            mode: item.mode,
            type: item.type === TreeItemType.Blob ? 'blob' : 'tree'
        };

        const childLink = getLinkUrl(
            request,
            `/api/${item.type === TreeItemType.Blob ? 'blobs' : 'trees'}` + `/${tree.programName}/${item.id}`
        );
        itemResourceBuilder.addSingleRelationship('child', {related: childLink});
        items.push(itemResourceBuilder.getProduct());
    }
    resourceBuilder.addManyRelationship('items', items);

    return Promise.resolve(resourceBuilder.getProduct());
}
export default serializeTree;
