import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import ProgramSerializer from "../serializer/ProgramSerializer";
import WorkingTreeFileSerializer from "../serializer/WorkingTreeFileSerializer";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, new ProgramSerializer());
modelRegistry.registerSerializer(WorkingTreeFile, new WorkingTreeFileSerializer());

export default modelRegistry;
