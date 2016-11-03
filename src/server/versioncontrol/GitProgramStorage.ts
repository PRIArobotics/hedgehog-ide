import fs = require('fs');
import path = require('path');
import rimraf = require('rimraf');
import NodeGit = require('nodegit');

import {wrapCallbackAsPromise} from "../../utils";
import IProgramStorage from "../../versioncontrol/ProgramStorage";
import Program from "../../versioncontrol/Program";
import * as GitVersionControlFactory from './GitVersionControlFactory';
import Blob from "../../versioncontrol/Blob";

export default class GitProgramStorage implements IProgramStorage {
    public storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    public createProgram(name: string): Promise<Program> {
        return NodeGit.Repository.init(this.getProgramPath(name), 0)
            .then((repository: NodeGit.Repository) => {
                let signature = NodeGit.Signature.now('Hedgehog', 'info@hedgehog.pria.at');
                return repository.createCommitOnHead(
                    [],
                    signature,
                    signature,
                    'initial commit');
            })
            .then(() => {
                return new Program(name, null);
            });
    }

    public deleteProgram(name: string): Promise<void> {
        return wrapCallbackAsPromise(fs.readdir, this.getProgramPath(name))
            .then(() => {
                return wrapCallbackAsPromise(rimraf, this.getProgramPath(name));
            });
    }

    public getProgramNames(): Promise<string[]> {
        return wrapCallbackAsPromise(fs.readdir, this.storagePath);
    }

    public getProgram(name: string): Promise<Program> {
        return NodeGit.Repository.open(this.getProgramPath(name))
            .then(() => {
                return new Program(name, null);
            });
    }

    public renameProgram(oldName: string, newName: string): Promise<void> {
        return wrapCallbackAsPromise(fs.stat, this.getProgramPath(newName))
            .then(() => {
                throw Error(`Program "${newName}" already exists.`);
            })
            .catch((err) => {
                if(err.code !== 'ENOENT') {
                    throw err;
                } else {
                    return wrapCallbackAsPromise(fs.rename, this.getProgramPath(oldName), this.getProgramPath(newName));
                }
            });
    }

    public resetProgram(programName: string, versionId: string): Promise<void> {
        return undefined;
    }

    public getBlob(programName: string, blobId: string): Promise<Blob> {
        return NodeGit.Repository.open(this.getProgramPath(programName))
            .then((repository) => {
                return repository.getBlob(blobId);
            })
            .then((blob) => {
                return GitVersionControlFactory.createBlob(programName, blob);
            });
    }

    /* tslint:disable */
    public getTree(programName: string, treeId: string) {
    }

    public getVersionIds(programName: string): Promise<string[]> {
        return undefined;
    }

    public getVersion(programName: string, versionId: string) {
    }

    public createVersionFromWorkingTree(programName: string) {
    }

    public getWorkingTree(programName: string) {
    }

    public getWorkingTreeDirectory(programName: string, path: string) {
    }

    public getWorkingTreeFile(programName: string, path: string) {
    }

    public createWorkingTreeDirectory(programName: string, path: string, mode?: string) {
    }

    public createWorkingTreeFile(programName: string, path: string, content?: string, mode?: string) {
    }

    public resetWorkingTree(programName: string) {
    }

    /* tslint:enable */
    private getProgramPath(name: string) {
        return path.join(this.storagePath, name);
    }
}
