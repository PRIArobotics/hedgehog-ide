import Hapi = require('hapi');
import {JsonApiResource} from "../jsonapi/JsonApiObjects";
import {JsonApiResourceBuilder, default as JsonApiDocumentBuilder} from "../jsonapi/JsonApiBuilder";
import {default as Sensor, SensorType} from "../../common/Sensor";

async function serializeSensor (sensor: Sensor,
                                request: Hapi.Request,
                                documentBuilder: JsonApiDocumentBuilder): Promise<JsonApiResource> {
    let resourceBuilder = new JsonApiResourceBuilder(documentBuilder);
    resourceBuilder.resource.type = 'sensor';
    resourceBuilder.resource.id = sensor.port.toString();
    resourceBuilder.resource.attributes = {
        type: sensor.type === SensorType.Analog ? 'analog' : 'digital',
        value: sensor.value
    };

    return resourceBuilder.getProduct();
}
export default serializeSensor;
