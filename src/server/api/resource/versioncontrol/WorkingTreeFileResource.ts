import winston = require("winston");
import {ReplyNoContinue, Request} from "hapi";

import ApiResource from "../../ApiResource";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, RequirementType} from "../../../jsonapi/Parser";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import WorkingTreeFile from "../../../../common/versioncontrol/WorkingTreeFile";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";
import ApiEndpoint from "../../ApiEndpoint";

export default class WorkingTreeFileResource extends ApiResource {

    private static fileParser = JsonApiResource.getParser().addProperties({
        name: 'attributes',
        required: RequirementType.Required,
        handler: new ObjectParser(() => ({}),
            { name: 'path' },
            { name: 'mode' },
            { name: 'content'},
            { name: 'encoding' }
        )
    });

    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/files/{programId}');
    }

    @ApiEndpoint('POST')
    public async createFile(req, reply) {
        const programName = genericFromBase64(req.params['programId']);

        // Parse request payload
        let requestData: JsonApiResource;
        try {
             requestData = WorkingTreeFileResource.fileParser.parse(req.payload.data, {
                 id: RequirementType.Forbidden,
                 attributes: {
                     path: RequirementType.Required
                 }
             });
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        // Create file
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

        // Return file
        return (await this.replyFile(programName, requestData.attributes.path, req, reply))
            .code(201);
    }

    @ApiEndpoint('GET', '/{fileId}')
    public async getFile(req, reply) {
        return this.replyFile(
            genericFromBase64(req.params['programId']),
            genericFromBase64(req.params['fileId']),
            req,
            reply
        );
    }

    @ApiEndpoint('PATCH', '/{fileId}')
    public async updateFile(req, reply) {
        const programName = genericFromBase64(req.params['programId']);
        let filePath = genericFromBase64(req.params['fileId']);

        // Update request payload
        let updatedFile;
        try {
            updatedFile = WorkingTreeFileResource.fileParser.parse(req.payload.data).attributes;
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        // Perform update
        // This will use the smallest number of program storage operations
        // by only performing updates when they are mandatory.

        // Move (rename) file if updated path != current path
        if((updatedFile.path && updatedFile.path !== filePath) || (updatedFile.mode && !updatedFile.content)) {
            await this.programStorage.updateWorkingTreeObject(programName, filePath, {
                newPath: updatedFile.path !== filePath ? updatedFile.path : null,
                mode: updatedFile.mode
            });

            if(updatedFile.path)
                filePath = updatedFile.path;
        }

        // Write content on content update
        if(updatedFile.content) {
            await this.programStorage.createOrUpdateWorkingTreeFile(
                programName,
                filePath,
                updatedFile.content,
                updatedFile.mode
            );
        }

        return this.replyFile(programName, filePath, req, reply);
    }

    @ApiEndpoint('DELETE', '/{fileId}')
    public async deleteFile(req, reply) {
        // TODO implement check whether file exists
        try {
            await this.programStorage.deleteWorkingTreeObject(
                genericFromBase64(req.params['programId']),
                genericFromBase64(req.params['fileId'])
            );
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'An error occurred while deleting the file'
            }).code(500);
        }
        return reply().code(204);
    }

    @ApiEndpoint('GET', '/{fileId}/content')
    public async getContent(req, reply) {
        let content: string;
        try {
            content = await this.programStorage.getWorkingTreeFileContent(
                genericFromBase64(req.params['programId']),
                genericFromBase64(req.params['fileId'])
            );
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Failed to retrieve file content'
            }).code(500);
        }
        return reply(content)
            .code(200);
    }

    private async replyFile(programName: string, filePath: string, request: Request, reply) {
        // Load file from storage
        let file: WorkingTreeFile;
        try {
            file = await this.programStorage.getWorkingTreeFile(programName, filePath);
        } catch(err) {
            winston.error(err);
            return reply({
                error: 'Error while fetching the file.'
            }).code(500);
        }

        // Serialize file
        let documentBuilder = new JsonApiDocumentBuilder();
        const selfLink = getLinkUrl(
            request,
            `/api/files/${genericToBase64(file.programName)}/${genericToBase64(file.path)}`
        );
        documentBuilder.setLinks(selfLink, null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(
            file,
            request,
            documentBuilder,
            request.query['content'] === 'true' || true
        ));

        // Return file
        return reply(documentBuilder.getProduct())
            .code(200);
    }
}
