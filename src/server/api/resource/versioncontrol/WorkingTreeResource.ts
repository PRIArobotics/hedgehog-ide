import Hapi = require('hapi');
import winston = require("winston");

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import ApiEndpoint from "../../ApiEndpoint";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";
import {genericToBase64, genericFromBase64} from "../../../../common/utils";

export default class WorkingTreeResource extends ApiResource {
    public constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/workingtrees/{programId}');
    }

    @ApiEndpoint('GET')
    public async getWorkingTree(request: Hapi.Request, reply: Hapi.IReply) {
        /*const programName = genericFromBase64(request.params['programId']);
        // Load workingtree object from storage
        let workingTree;
        try {
            workingTree = await this.programStorage.getWorkingTree(programName);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while fetching the file.'
            }).code(500);
        }

        console.log(workingTree);

        // Serialize workingtree object
        let documentBuilder = new JsonApiDocumentBuilder();
        const selfLink = getLinkUrl(
            request,
            `/api/workingtrees/${genericToBase64(programName)}`
        );
        documentBuilder.setLinks(selfLink, null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(workingTree, request, documentBuilder));

        console.log(documentBuilder.getProduct());
        // Return serialized workingtree
        return reply(documentBuilder.getProduct())
            .code(200);*/
    }
}
