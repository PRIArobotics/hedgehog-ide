import MotorResource from './MotorResource';
import ServoResource from "./ServoResource";
import SensorResource from "./SensorResource";
import VersionResource from "./VersionResource";
import EmergencyResource from "./EmergencyResource";
import Api from '../../Api';
import modelRegistry from "../../../jsonapi/ModelSerializerRegistry";

export default function registerResources(api: Api, {hedgehog}) {
    api.registerResource(new MotorResource(hedgehog, modelRegistry));
    api.registerResource(new ServoResource(hedgehog, modelRegistry));
    api.registerResource(new SensorResource(hedgehog, modelRegistry));
    api.registerResource(new VersionResource(hedgehog, modelRegistry));
    api.registerResource(new EmergencyResource(hedgehog, modelRegistry));
}
