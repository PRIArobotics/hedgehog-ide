import SerializerRegisty from "./SerializerRegistry";
import {NodeProcess} from "../process/NodeProcessManager";
import Sensor from "../../common/Sensor";
import Version from "../../common/Version";
import Emergency from "../../common/Emergency";
import serializeProcess from "../serializer/ProcessSerializer";
import serializeSensor from "../serializer/SensorSerializer";
import serializeVersion from "../serializer/VersionSerializer";
import serializeEmergency from "../serializer/EmergencySerializer";

import registerVersioncontrolSerializers from "./versioncontrol";

export default function registerSerializers(registry: SerializerRegisty) {
    registerVersioncontrolSerializers(registry);
    // We need a class so we cannot use the IProcess interface here
    // Instead, use NodeProcess
    registry.registerSerializer(NodeProcess, serializeProcess);
    registry.registerSerializer(Sensor, serializeSensor);
    registry.registerSerializer(Version, serializeVersion);
    registry.registerSerializer(Emergency, serializeEmergency);
}
