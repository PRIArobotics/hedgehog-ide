import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import {genericToBase64, genericFromBase64} from "../../../../common/utils";
import {getLinkUrl} from "../../../utils";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import Tree from "../../../../common/versioncontrol/Tree";

export default class TreeResource extends ApiResource {
    public constructor (private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/trees/{programId}');
    }

    @ApiEndpoint('GET', '{treeId}')
    public async getTree (req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);
        const treeId = req.params['treeId'];

        let tree: Tree;
        try {
            tree = await this.programStorage.getTree(programName, treeId);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to load tree'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/trees/${genericToBase64(programName)}/${treeId}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(tree, req, documentBuilder));

        return documentBuilder.getProduct();
    }
}
