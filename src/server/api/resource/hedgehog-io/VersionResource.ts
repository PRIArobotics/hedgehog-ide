import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";
import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import {getLinkUrl, getRequestUrl} from "../../../utils";
import Version from "../../../../common/Version";
import {default as JsonApiDocumentBuilder , DataType} from "../../../jsonapi/JsonApiBuilder";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";

export default class VersionResource extends ApiResource {

    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/version');
    }

    @ApiEndpoint('GET')
    public async getVersion (req: Request) {
        let version = new Version();

        let versionInput = await this.hedgehog.getVersion();
        const byteToHex = b => ('00' + b.toString(16)).slice(-2);

        version.ucId = Array.prototype.map.call(versionInput.ucId, byteToHex).join(':');
        version.hardwareVersion = versionInput.hardwareVersion;
        version.firmwareVersion = versionInput.firmwareVersion;
        version.serverVersion = versionInput.serverVersion;
        version.ideVersion = "develop";

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/version`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(version, req, documentBuilder));
        return documentBuilder.getProduct();
    }
}
