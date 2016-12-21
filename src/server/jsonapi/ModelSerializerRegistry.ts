import SerializerRegisty from "../serializer/SerializerRegistry";
import Program from "../../common/versioncontrol/Program";
import ProgramSerializer from "../serializer/ProgramSerializer";

let modelRegistry = new SerializerRegisty();
modelRegistry.registerSerializer(Program, new ProgramSerializer());

export default modelRegistry;
