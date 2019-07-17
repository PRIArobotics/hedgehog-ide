import {Request} from "hapi";
import {HedgehogClient} from 'hedgehog-client';

import ApiResource from "../../ApiResource";
import SerializerRegistry from "../../../serializer/SerializerRegistry";
import ApiEndpoint from "../../ApiEndpoint";
import {getLinkUrl} from "../../../utils";
import Emergency from "../../../../common/Emergency";
import JsonApiDocumentBuilder from "../../../jsonapi/JsonApiBuilder";

export default class EmergencyResource extends ApiResource {

    public constructor (private hedgehog: HedgehogClient, private serializerRegistry: SerializerRegistry) {
        super('/emergency');
    }

    @ApiEndpoint('GET')
    public async getEmergencyState (req: Request) {
        let emergency = new Emergency();

        emergency.active = await this.hedgehog.getEmergencyStop();

        let documentBuilder = new JsonApiDocumentBuilder();
        documentBuilder.setLinks(getLinkUrl(req, `/api/emergency`), null);
        documentBuilder.addResource(await this.serializerRegistry.serialize(emergency, req, documentBuilder));
        return documentBuilder.getProduct();
    }
}
