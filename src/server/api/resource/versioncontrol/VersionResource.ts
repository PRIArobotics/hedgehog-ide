import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import Version from "../../../../common/versioncontrol/Version";
import {getLinkUrl, getRequestUrl} from "../../../utils";
import {default as JsonApiDocumentBuilder, DataType} from "../../../jsonapi/JsonApiBuilder";
import ApiEndpoint from "../../ApiEndpoint";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {RequirementType, ObjectParser} from "../../../jsonapi/Parser";

export default class VersionResource extends ApiResource {
    public constructor (private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/versions/{programId}');
    }

    @ApiEndpoint('POST')
    public async createVersion (req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);

        let versionParser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties(
                {
                    name: 'attributes',
                    required: RequirementType.Required,
                    handler: new ObjectParser(() => ({}),
                        { name: 'tag'},
                        {
                            name: 'message',
                            required: RequirementType.Required
                        }
                    )
                }
            )
        });

        let message = '';
        let tag = null;

        if (req.payload) {
            let document: JsonApiDocument;
            try {
                document = versionParser.parse(req.payload);
            } catch(err) {
                winston.error(err);
                return h.response({
                    error: 'Error while parsing the request.'
                }).code(400);
            }
            message = (document.data as JsonApiResource).attributes.message;
            tag = (document.data as JsonApiResource).attributes.tag;
        }

        let versionId: string;
        try {
            versionId = await this.programStorage.createVersionFromWorkingTree(programName, message, tag);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to save version'
            }).code(500);
        }
        return h.response(this.replyVersion(versionId, req, h)).code(201);
    }

    @ApiEndpoint('GET')
    public async getVersionList (req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getRequestUrl(req), null);
        documentBuilder.setDataType(DataType.Many);

        let versionIds: string[];
        try {
            versionIds = await this.programStorage.getVersionIds(programName);
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Failed to load version list'
            }).code(500);
        }

        for(const id of versionIds) {
            try {
                let version = await this.programStorage.getVersion(programName, id);
                documentBuilder.addResource(await this.serializerRegistry.serialize(version, req, documentBuilder));
            } catch(err) {
                winston.error(err);
            }
        }

        return documentBuilder.getProduct();
    }


    @ApiEndpoint('GET', '/{versionId}')
    public async getVersion (req: Request, h: ResponseToolkit) {
        const versionId = req.params['versionId'];
        return this.replyVersion(versionId, req, h);
    }

    public async replyVersion (versionId: string, req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);

        let version: Version;
        try {
            version = await this.programStorage.getVersion(programName, versionId);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to load version'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/versions/${genericToBase64(programName)}/${versionId}`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(version, req, documentBuilder));

        return documentBuilder.getProduct();
    }
}
