import ApiResource from "../../ApiResource";
import ApiEndpoint from "../../ApiEndpoint";
import * as Hapi from "hapi";
import {JsonApiDocument, JsonApiResource} from "../../../jsonapi/JsonApiObjects";
import {ObjectParser, RequirementType} from "../../../jsonapi/Parser";
import winston = require("winston");
import jwt = require('jsonwebtoken');
import passwd = require('passwd-linux');
import {wrapCallbackAsPromise} from "../../../../common/utils";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";

export default class AuthenticationResource extends ApiResource {

    public constructor (private jwtSecret: string) {
        super('/auth');
    }

    @ApiEndpoint('POST', '/login')
    public async login(req: Hapi.Request, reply: Hapi.IReply) {
        let parser = JsonApiDocument.getParser().addProperties({
            name: 'data',
            required: RequirementType.Required,
            handler: JsonApiResource.getParser().addProperties(
                {
                    name: 'id',
                    required: RequirementType.Forbidden
                },
                {
                    name: 'attributes',
                    required: RequirementType.Required,
                    handler: new ObjectParser(() => ({}),
                        {
                            name: 'username',
                            required: RequirementType.Required
                        },
                        {
                            name: 'password',
                            required: RequirementType.Required
                        }
                    )
                }
            )
        });

        let requestData: JsonApiResource;
        try {
            requestData = parser.parse(req.payload).data as JsonApiResource;
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Error while parsing the request. Argument might be missing.'
            }).code(400);
        }

        // Check userdata
        let passwordCorrect: boolean = true;
        /*try {
            passwordCorrect = (await wrapCallbackAsPromise(
                passwd.checkPass,
                requestData.attributes.username,
                requestData.attributes.password
            ) === 'passwordCorrect');
        } catch (err) {
            winston.error(err);
            return reply({
                error: 'Could not log in user.'
            }).code(500);
        }*/

        if (!passwordCorrect) {
            return reply({
                error: 'Could not log in user. Wrong username or password.'
            }).code(401);
        }

        // Generate JWT token
        const token = await wrapCallbackAsPromise(
            jwt.sign,
            { username: requestData.attributes.username },
            this.jwtSecret,
            { expiresIn: '1d' }
        );

        let documentBuilder = new JsonApiDocumentBuilder();
        let resourceBuilder = documentBuilder.getResourceBuilder();
        resourceBuilder.resource.type = 'token';
        resourceBuilder.resource.attributes = {token};
        documentBuilder.addResource(resourceBuilder.getProduct());
        return reply(documentBuilder.getProduct())
            .code(200);
    }
}