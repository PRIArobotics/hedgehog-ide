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

        // Build parser
        const attributesParser = this.getFileAttributesParser();
        attributesParser.addProperties({
            name: 'path',
            required: true
        });
        const fileParser = JsonApiResource.getParser();
        fileParser.addProperties({
            name: 'attributes',
            required: true,
            handler: parserHandler(attributesParser)
        });

        // Parse request payload
        let requestData: JsonApiResource;
        try {
             requestData = fileParser.parse(req.payload.data);
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
        return await this.replyFile(
            genericFromBase64(req.params['programId']),
            genericFromBase64(req.params['fileId']),
            req,
            reply
        );
    }

    @ApiEndpoint('PATCH', '/{fileId}')
    public async updateFile(req, reply) {
        const programName = genericFromBase64(req.params['programId']);
        let currentFilePath = genericFromBase64(req.params['fileId']);

        // Build parser
        const attributesParser = this.getFileAttributesParser();
        attributesParser.addProperties({
            name: 'path',
            required: false
        });
        const fileParser = JsonApiResource.getParser();
        fileParser.addProperties(
            {
                name: 'id',
                required: true
            },
            {
                name: 'attributes',
                required: true,
                handler: parserHandler(attributesParser)
            }
        );

        // Update request payload
        let updatedFile;
        try {
            updatedFile = fileParser.parse(req.payload.data).attributes;
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
        if((updatedFile.path && updatedFile.path !== currentFilePath) || (updatedFile.mode && !updatedFile.content)) {
            await this.programStorage.updateWorkingTreeObject(programName, currentFilePath, {
                newPath: updatedFile.path !== currentFilePath ? updatedFile.path : null,
                mode: updatedFile.mode
            });

            if(updatedFile.path)
                currentFilePath = updatedFile.path;
        }

        // Write content on content update
        if(updatedFile.content) {
            await this.programStorage.createOrUpdateWorkingTreeFile(
                programName,
                currentFilePath,
                updatedFile.content,
                updatedFile.mode
            );
        }

        return this.replyFile(programName, currentFilePath, req, reply);
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

    private async replyFile(programName: string, fileName: string, request, reply) {
        // Load file from storage
        let file: WorkingTreeFile;
        try {
            file = await this.programStorage.getWorkingTreeFile(programName, fileName);
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
            `/api/workingtrees/${genericToBase64(file.programName)}/files/${genericToBase64(file.path)}`
        );

        documentBuilder.setLinks(selfLink, null);

        documentBuilder.addResource(
        await this.serializerRegistry.serialize(file, request, documentBuilder.getResourceBuilder()));

        // Return file
        return reply(documentBuilder.getProduct())
            .code(200);
    }

    private getFileAttributesParser() {
        return new ObjectParser(() => ({}),
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
        );
    }
}
