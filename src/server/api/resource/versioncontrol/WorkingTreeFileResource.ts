import winston = require("winston");

import ApiResource from "../../ApiResource";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {parserHandler, ObjectParser} from "../../../jsonapi/Parser";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import WorkingTreeFile from "../../../../common/versioncontrol/WorkingTreeFile";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";
import ApiEndpoint from "../../ApiEndpoint";

export default class WorkingTreeFileResource extends ApiResource {
    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/workingtrees/{programId}/files');
    }

    @ApiEndpoint('POST')
    public async createFile(req, reply) {
        const programName = genericFromBase64(req.params['programId']);

        let fileParser = JsonApiResource.getParser();
        fileParser.addProperties({
            name: 'attributes',
            required: true,
            handler: parserHandler(
                new ObjectParser(() => ({}),
                {
                    name: 'path',
                    required: true
                },
                {
                    name: 'mode',
                    required: false
                },
                {
                    name: 'content',
                    required: false
                },
                {
                    name: 'encoding',
                    required: false
                }
            ))
        });
        let requestData: JsonApiResource;
        try {
             requestData = fileParser.parse(req.payload.data);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        try {
            await this.programStorage.createOrUpdateWorkingTreeFile(
                programName,
                requestData.attributes.path,
                requestData.attributes.content,
                requestData.attributes.mode
            );
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while writing file.'
            }).code(500);
        }

        return (await this.replyFile(programName, requestData.attributes.path, req, reply))
            .code(201);
    }

    @ApiEndpoint('GET', '/{fileId}')
    public async getFile(req, reply) {
        return await this.replyFile(
            genericFromBase64(req.params['programId']),
            genericFromBase64(req.params['fileId']),
            req,
            reply
        );
    }

    private async replyFile(programName: string, fileName: string, request, reply) {
        let file: WorkingTreeFile;
        try {
            file = await this.programStorage.getWorkingTreeFile(programName, fileName);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while fetching the file.'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        const selfLink = getLinkUrl(
            request,
            `/api/workingtrees/${genericToBase64(file.programName)}/files/${genericToBase64(file.path)}`
        );

        documentBuilder.setLinks(selfLink, null);

        documentBuilder.addResource(
        await this.serializerRegistry.serialize(file, request, documentBuilder.getResourceBuilder()));

        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
