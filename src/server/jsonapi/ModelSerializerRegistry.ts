import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import ProgramSerializer from "../serializer/ProgramSerializer";
import WorkingTreeFileSerializer from "../serializer/WorkingTreeFileSerializer";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectorySerializer from "../serializer/WorkingTreeDirectorySerializer";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, new ProgramSerializer());
modelRegistry.registerSerializer(WorkingTreeFile, new WorkingTreeFileSerializer());
modelRegistry.registerSerializer(WorkingTreeDirectory, new WorkingTreeDirectorySerializer());

export default modelRegistry;
