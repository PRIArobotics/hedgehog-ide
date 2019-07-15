import ProgramResource from './ProgramResource';
import WorkingTreeFileResource from "./WorkingTreeFileResource";
import WorkingTreeDirectoryResource from "./WorkingTreeDirectoryResource";
import BlobResource from "./BlobResource";
import TreeResource from "./TreeResource";
import VersionResource from "./VersionResource";
import Api from '../../Api';
import modelRegistry from "../../../jsonapi/ModelSerializerRegistry";

export default function registerResources(api: Api, {programStorage}) {
    api.registerResource(new ProgramResource(programStorage, modelRegistry));
    api.registerResource(new WorkingTreeFileResource(programStorage, modelRegistry));
    api.registerResource(new WorkingTreeDirectoryResource(programStorage, modelRegistry));
    api.registerResource(new BlobResource(programStorage, modelRegistry));
    api.registerResource(new TreeResource(programStorage, modelRegistry));
    api.registerResource(new VersionResource(programStorage, modelRegistry));
}
