import NodeGit = require('nodegit');
import Blob from "../../versioncontrol/Blob";

export function createBlob(programName: string, gitBlob: NodeGit.Blob): Blob {
    return new Blob(programName, gitBlob.id().tostrS(), gitBlob.rawsize());
}
