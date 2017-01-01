import Hapi = require('hapi');
import winston = require('winston');

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import {JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, parserHandler} from "../../../jsonapi/Parser";
import WorkingTreeDirectory from "../../../../common/versioncontrol/WorkingTreeDirectory";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";

export default class WorkingTreeDirectoryResource extends ApiResource {
    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/workingtrees/{programId}/directories');
    }

    @ApiEndpoint('POST')
    public async createDirectory(req: Hapi.Request, reply: Hapi.IReply) {
        const programName = genericFromBase64(req.params['programId']);

        // Build parser
        let requestParser = JsonApiResource.getParser();
        requestParser.addProperties({
            name: 'attributes',
            required: true,
            handler: parserHandler(new ObjectParser(() => ({}),
                {
                    name: 'mode',
                    required: false
                },
                {
                    name: 'path',
                    required: true
                }
            ))
        });

        // Parse request payload
        let directoryData;
        try {
            directoryData = requestParser.parse(req.payload.data).attributes;
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        // Create directory
        try {
            await this.programStorage.createWorkingTreeDirectory(programName, directoryData.path, directoryData.mode);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Failed to create file.'
            }).code(500);
        }

        return (await this.replyDirectory(programName, directoryData.path, req, reply))
            .code(201);
    }

    private async replyDirectory(programName: string,
                                 directoryPath: string,
                                 request: Hapi.Request,
                                 reply: Hapi.IReply) {
        let directory: WorkingTreeDirectory;
        try {
            directory = await this.programStorage.getWorkingTreeDirectory(programName, directoryPath);
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Error while fetching the file.'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        const selfLink = getLinkUrl(
            request,
            `/api/workingtrees/${genericToBase64(directory.programName)}/files/${genericToBase64(directory.path)}`
        );
        documentBuilder.setLinks(selfLink, null);
        documentBuilder.addResource(
            await this.serializerRegistry.serialize(directory, request, documentBuilder.getResourceBuilder()));

        // Return file
        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
