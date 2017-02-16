import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import Blob from "../../common/versioncontrol/Blob";
import Tree from "../../common/versioncontrol/Tree";
import Version from "../../common/versioncontrol/Version";
import {NodeProcess} from "../process/NodeProcessManager";
import serializeProgram from "../serializer/ProgramSerializer";
import serializeWorkingTreeFile from "../serializer/WorkingTreeFileSerializer";
import serializeWorkingTreeDirectory from "../serializer/WorkingTreeDirectorySerializer";
import serializeProcess from "../serializer/ProcessSerializer";
import serializeTree from "../serializer/TreeSerializer";
import serializeBlob from "../serializer/BlobSerializer";
import serializeVersion from "../serializer/VersionSerializer";
import serializeSensor from "../serializer/SensorSerializer";
import Sensor from "../../common/Sensor";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, serializeProgram);
modelRegistry.registerSerializer(WorkingTreeFile, serializeWorkingTreeFile);
modelRegistry.registerSerializer(WorkingTreeDirectory, serializeWorkingTreeDirectory);
modelRegistry.registerSerializer(Blob, serializeBlob);
modelRegistry.registerSerializer(Tree, serializeTree);
modelRegistry.registerSerializer(Version, serializeVersion);

// We need a class so we cannot use the IProcess interface here
// Instead, use NodeProcess
modelRegistry.registerSerializer(NodeProcess, serializeProcess);
modelRegistry.registerSerializer(Sensor, serializeSensor);

export default modelRegistry;
