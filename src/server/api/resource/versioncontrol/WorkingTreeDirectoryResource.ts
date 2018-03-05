import winston = require('winston');
import {Request, ResponseToolkit} from "hapi";

import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import IProgramStorage from "../../../../common/versioncontrol/ProgramStorage";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import {genericFromBase64, genericToBase64} from "../../../../common/utils";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, RequirementType} from "../../../jsonapi/Parser";
import WorkingTreeDirectory from "../../../../common/versioncontrol/WorkingTreeDirectory";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";
import {getLinkUrl} from "../../../utils";

export default class WorkingTreeDirectoryResource extends ApiResource {

    private static directoryParser = JsonApiResource.getParser().addProperties({
        name: 'attributes',
        required: RequirementType.Required,
        handler: new ObjectParser(() => ({}),
            { name: 'path' },
            { name: 'mode' }
        )
    });

    constructor(private programStorage: IProgramStorage, private serializerRegistry: SerializerRegistry) {
        super('/directories/{programId}');
    }

    @ApiEndpoint('POST')
    public async createDirectory(req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);

        // Parse request payload
        let directoryData;
        try {
            directoryData = WorkingTreeDirectoryResource.directoryParser.parse((req.payload as JsonApiDocument).data, {
                id: RequirementType.Forbidden,
                attributes: {
                    path: RequirementType.Required
                }
            }).attributes;
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        // Create directory
        try {
            await this.programStorage.createWorkingTreeDirectory(programName, directoryData.path, directoryData.mode);
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Failed to create file.'
            }).code(500);
        }

        return h.response(await this.replyDirectory(programName, directoryData.path, req, h)).code(201);
    }

    @ApiEndpoint('GET', '/{directoryId}')
    public async getDirectory(req: Request, h: ResponseToolkit) {
        return this.replyDirectory(
            genericFromBase64(req.params['programId']),
            genericFromBase64(req.params['directoryId']),
            req,
            h
        );
    }

    @ApiEndpoint('PATCH', '/{directoryId}')
    public async updateDirectory(req: Request, h: ResponseToolkit) {
        const programName = genericFromBase64(req.params['programId']);
        let oldDirectoryPath = genericFromBase64(req.params['directoryId']);

        // Parse request payload
        let directoryData;
        try {
            const data: JsonApiResource = (req.payload as JsonApiDocument).data as JsonApiResource;
            directoryData = WorkingTreeDirectoryResource.directoryParser.parse(data.attributes);
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'Error while parsing the request. Arguments might be missing.'
            }).code(400);
        }

        try {
            await this.programStorage.updateWorkingTreeObject(programName, oldDirectoryPath, {
                newPath: directoryData.path,
                mode: directoryData.mode
            });
        } catch (err) {
            return h.response({
                error: 'Failed to update the directory.'
            }).code(500);
        }

        return this.replyDirectory(
            programName,
            directoryData.path || oldDirectoryPath,
            req,
            h
        );
    }

    @ApiEndpoint('DELETE', '/{directoryId}')
    public async deleteDirectory(req: Request, h: ResponseToolkit) {
        // TODO implement check whether file exists
        try {
            await this.programStorage.deleteWorkingTreeObject(
                genericFromBase64(req.params['programId']),
                genericFromBase64(req.params['directoryId'])
            );
        } catch(err) {
            winston.error(err);
            return h.response({
                error: 'An error occurred while deleting the file'
            }).code(500);
        }
        return h.response().code(204);
    }

    private async replyDirectory(programName: string,
                                 directoryPath: string,
                                 request: Request,
                                 h: ResponseToolkit) {
        let directory: WorkingTreeDirectory;
        try {
            directory = await this.programStorage.getWorkingTreeDirectory(programName, directoryPath);
        } catch (err) {
            winston.error(err);
            return h.response({
                error: 'Error while fetching the directory.'
            }).code(500);
        }

        let documentBuilder = new JsonApiDocumentBuilder();
        const selfLink = getLinkUrl(
            request,
            `/api/directories/${genericToBase64(directory.programName)}/${genericToBase64(directory.path)}`
        );
        documentBuilder.setLinks(selfLink, null);
        documentBuilder.addResource(
            await this.serializerRegistry.serialize(directory, request, documentBuilder));

        // Return file
        return documentBuilder.getProduct();
    }
}
