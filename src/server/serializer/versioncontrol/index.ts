import SerializerRegisty from "../SerializerRegistry";
import Program from "../../../common/versioncontrol/Program";
import WorkingTreeFile from "../../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../../common/versioncontrol/WorkingTreeDirectory";
import Blob from "../../../common/versioncontrol/Blob";
import Tree from "../../../common/versioncontrol/Tree";
import Version from "../../../common/versioncontrol/Version";
import serializeProgram from "./ProgramSerializer";
import serializeWorkingTreeFile from "./WorkingTreeFileSerializer";
import serializeWorkingTreeDirectory from "./WorkingTreeDirectorySerializer";
import serializeTree from "./TreeSerializer";
import serializeBlob from "./BlobSerializer";
import serializeVersion from "./VersionSerializer";

export default function registerSerializers(registry: SerializerRegisty) {
    registry.registerSerializer(Program, serializeProgram);
    registry.registerSerializer(WorkingTreeFile, serializeWorkingTreeFile);
    registry.registerSerializer(WorkingTreeDirectory, serializeWorkingTreeDirectory);
    registry.registerSerializer(Blob, serializeBlob);
    registry.registerSerializer(Tree, serializeTree);
    registry.registerSerializer(Version, serializeVersion);
}
