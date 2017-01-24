import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import serializeProgram from "../serializer/ProgramSerializer";
import serializeWorkingTreeFile from "../serializer/WorkingTreeFileSerializer";
import serializeWorkingTreeDirectory from "../serializer/WorkingTreeDirectorySerializer";
import serializeProcess from "../serializer/ProcessSerializer";
import {NodeProcess} from "../process/NodeProcessManager";
import serializeBlob from "../serializer/BlobSerializer";
import Blob from "../../common/versioncontrol/Blob";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, serializeProgram);
modelRegistry.registerSerializer(WorkingTreeFile, serializeWorkingTreeFile);
modelRegistry.registerSerializer(WorkingTreeDirectory, serializeWorkingTreeDirectory);
modelRegistry.registerSerializer(Blob, serializeBlob);

// We need a class so we cannot use the IProcess interface here
// Instead, use NodeProcess
modelRegistry.registerSerializer(NodeProcess, serializeProcess);

export default modelRegistry;
