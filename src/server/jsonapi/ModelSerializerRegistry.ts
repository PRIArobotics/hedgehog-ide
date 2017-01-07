import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import serializeProgram from "../serializer/ProgramSerializer";
import serializeWorkingTreeFile from "../serializer/WorkingTreeFileSerializer";
import serializeWorkingTreeDirectory from "../serializer/WorkingTreeDirectorySerializer";
import {Process} from "../process/ProcessManager";
import serializeProcess from "../serializer/ProcessSerializer";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, serializeProgram);
modelRegistry.registerSerializer(WorkingTreeFile, serializeWorkingTreeFile);
modelRegistry.registerSerializer(WorkingTreeDirectory, serializeWorkingTreeDirectory);

modelRegistry.registerSerializer(Process, serializeProcess);

export default modelRegistry;
