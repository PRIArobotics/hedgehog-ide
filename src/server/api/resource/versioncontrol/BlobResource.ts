import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import Blob from "../../../../common/versioncontrol/Blob";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import SerializerRegistry from "../../../serializer/SerializerRegistry";

export default class BlobResource extends ApiResource {
    public constructor (private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/blobs/{programId}');
    }

    @ApiEndpoint('GET', '/{blobId}')
    public async getBlob (req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);
        const blobId = req.params['blobId'];

        let blob: Blob;
        try {
            blob = await this.programStorage.getBlob(programName, blobId);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to load blob'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/blobs/${genericToBase64(programName)}/${blobId}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(blob, req, documentBuilder));

        return documentBuilder.getProduct();
    }
}
