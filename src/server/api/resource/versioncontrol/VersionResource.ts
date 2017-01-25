import Hapi = require('hapi');
import winston = require("winston");

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import Version from "../../../../common/versioncontrol/Version";
import {getLinkUrl} from "../../../utils";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import ApiEndpoint from "../../ApiEndpoint";

export default class VersionResource extends ApiResource {
    public constructor (private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/versions/{programId}');
    }


    @ApiEndpoint('GET', '/{versionId}')
    public async getVersion (req: Hapi.Request, reply: Hapi.IReply) {
        const programName = genericFromBase64(req.params['programId']);
        const versionId = req.params['versionId'];

        let version: Version;
        try {
            version = await this.programStorage.getVersion(programName, versionId);
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Failed to load blob'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/versions/${genericToBase64(programName)}/${versionId}`), null);
        documentBuilder.addResource( await this.serializerRegistry.serialize(version, req, documentBuilder));

        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
