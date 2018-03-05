import winston = require("winston");
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
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
    public async createFile(req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);

        // Parse request payload
        let requestData: JsonApiResource;
        try {
             requestData = WorkingTreeFileResource.fileParser.parse((req.payload as JsonApiDocument).data, {
                 id: RequirementType.Forbidden,
                 attributes: {
                     path: RequirementType.Required
                 }
             });
        } catch(err) {
            winston.error(err);
            return h.response({
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
            return h.response({
                error: 'Error while writing file.'
            }).code(500);
        }

        // Return file
        return h.response(await this.replyFile(programName, requestData.attributes.path, req, h)).code(201);
    }

    @ApiEndpoint('GET', '/{fileId}')
    public async getFile(req, h: ResponseToolkit) {
        return this.replyFile(
            genericFromBase64(req.params['programId']),
            genericFromBase64(req.params['fileId']),
            req,
            h
        );
    }

    @ApiEndpoint('PATCH', '/{fileId}')
    public async updateFile(req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);
        let filePath = genericFromBase64(req.params['fileId']);

        // Update request payload
        let updatedFile;
        try {
            updatedFile = WorkingTreeFileResource.fileParser.parse((req.payload as JsonApiDocument).data).attributes;
        } catch(err) {
            winston.error(err);
            return h.response({
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

        return this.replyFile(programName, filePath, req, h);
    }

    @ApiEndpoint('DELETE', '/{fileId}')
    public async deleteFile(req: Request, h: ResponseToolkit) {
        // TODO implement check whether file exists
        try {
            await this.programStorage.deleteWorkingTreeObject(
                genericFromBase64(req.params['programId']),
                genericFromBase64(req.params['fileId'])
            );
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'An error occurred while deleting the file'
            }).code(500);
        }
        return h.response().code(204);
    }

    @ApiEndpoint('GET', '/{fileId}/content')
    public async getContent(req: Request, h: ResponseToolkit) {
        let content: string;
        try {
            content = await this.programStorage.getWorkingTreeFileContent(
                genericFromBase64(req.params['programId']),
                genericFromBase64(req.params['fileId'])
            );
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Failed to retrieve file content'
            }).code(500);
        }
        return content;
    }

    private async replyFile(programName: string, filePath: string, request: Request, h: ResponseToolkit) {
        // Load file from storage
        let file: WorkingTreeFile;
        try {
            file = await this.programStorage.getWorkingTreeFile(programName, filePath);
        } catch(err) {
            winston.error(err);
            return h.response({
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
        return documentBuilder.getProduct();
    }
}
