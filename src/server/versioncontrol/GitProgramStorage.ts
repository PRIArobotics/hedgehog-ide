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

    public async createProgram(name: string): Promise<Program> {
        const signature = NodeGit.Signature.now('Hedgehog', 'info@hedgehog.pria.at');

        let repository = await NodeGit.Repository.init(this.getProgramPath(name), 0);

        await repository.createCommitOnHead(
            [],
            signature,
            signature,
            'initial commit'
        );
        return new Program(name, null);
    }

    public async deleteProgram(name: string): Promise<void> {
        await wrapCallbackAsPromise(fs.readdir, this.getProgramPath(name));
        await wrapCallbackAsPromise(rimraf, this.getProgramPath(name));
    }

    public async getProgramNames(): Promise<string[]> {
        await wrapCallbackAsPromise(fs.readdir, this.storagePath);
    }

    public async getProgram(name: string): Promise<Program> {
        await NodeGit.Repository.open(this.getProgramPath(name));
        return new Program(name, null);
    }

    public async renameProgram(oldName: string, newName: string): Promise<void> {
        try {
            wrapCallbackAsPromise(fs.stat, this.getProgramPath(newName));
            throw Error(`Program "${newName}" already exists.`);
        } catch(err) {
            if(err.code !== 'ENOENT') {
                throw err;
            } else {
                await wrapCallbackAsPromise(fs.rename, this.getProgramPath(oldName), this.getProgramPath(newName));
            }
        }
    }

    public resetProgram(programName: string, versionId: string): Promise<void> {
        return undefined;
    }

    public async getBlob(programName: string, blobId: string): Promise<Blob> {
        let repository = await NodeGit.Repository.open(this.getProgramPath(programName));
        return GitVersionControlFactory.createBlob(programName, await repository.getBlob(blobId));
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
