import fs = require('fs');
import path = require('path');
import rimraf = require('rimraf');
import NodeGit = require('nodegit');

import {wrapCallbackAsPromise} from "../../utils";
import IProgramStorage from "../../versioncontrol/ProgramStorage";
import Program from "../../versioncontrol/Program";
import * as GitVersionControlFactory from './GitVersionControlFactory';
import Blob from "../../versioncontrol/Blob";
import Tree from "../../versioncontrol/Tree";
import Version from "../../versioncontrol/Version";
import WorkingTree from "../../versioncontrol/WorkingTree";
import WorkingTreeFile from "../../versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../versioncontrol/WorkingTreeDirectory";

export default class GitProgramStorage implements IProgramStorage {
    public static readonly signature = NodeGit.Signature.now('Hedgehog', 'info@hedgehog.pria.at');

    private static normalizePath(pathToNormalize) {
        pathToNormalize = path.normalize(pathToNormalize);
        return pathToNormalize.replace(/\/$/, "");
    }

    public storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    public async createProgram(name: string): Promise<Program> {
        let repository = await NodeGit.Repository.init(this.getProgramPath(name), 0);

        await repository.createCommitOnHead(
            [],
            GitProgramStorage.signature,
            GitProgramStorage.signature,
            'initial commit'
        );

        return new Program(name, null);
    }

    public async deleteProgram(name: string): Promise<void> {
        await wrapCallbackAsPromise(fs.readdir, this.getProgramPath(name));
        await wrapCallbackAsPromise(rimraf, this.getProgramPath(name));
    }

    public getProgramNames(): Promise<string[]> {
        return wrapCallbackAsPromise(fs.readdir, this.storagePath);
    }

    public async getProgram(name: string): Promise<Program> {
        await NodeGit.Repository.open(this.getProgramPath(name));
        return new Program(name, null);
    }

    public async renameProgram(oldName: string, newName: string): Promise<void> {
        try {
            await wrapCallbackAsPromise(fs.stat, this.getProgramPath(newName));
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

    public async getBlobContent(programName: string, blobId: string, encoding?: string): Promise<string> {
        let repository = await this.getRepository(programName);
        return (await repository.getBlob(blobId)).toString();
    }

    public async getTree(programName: string, treeId: string): Promise<Tree> {
        let repository = await this.getRepository(programName);
        return GitVersionControlFactory.createTree(programName, await repository.getTree(treeId));
    }

    public async getVersionIds(programName: string): Promise<string[]> {
        let branchCommit = await (await this.getRepository(programName)).getHeadCommit();

        return new Promise<string[]>((resolve, reject) => {
            let eventEmitter = branchCommit.history();

            eventEmitter.on('end', (commits: NodeGit.Commit[]) => {
                resolve(commits.map((commit) => {return commit.id().tostrS();}));
            });

            eventEmitter.on('error', reject);

            eventEmitter.start();
        });
    }

    public async getVersion(programName: string, versionId: string): Promise<Version> {
        let repository = await this.getRepository(programName);
        let versionCommit = await repository.getCommit(versionId);

        let tag = null;
        for(let currentTag of await NodeGit.Tag.list(repository)) {
            currentTag = await repository.getTagByName(currentTag);

            if(currentTag.targetId().equal(versionCommit.id())) {
                tag = currentTag;
                break;
            }
        }

        return GitVersionControlFactory.createVersion(programName, tag, versionCommit);
    }

    public async createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string> {
        let repository = await this.getRepository(programName);
        let index: any = await repository.index();
        await index.addAll();
        await index.write();
        const treeId: NodeGit.Oid = await index.writeTree();

        const parentId = (await repository.getHeadCommit()).id();
        const commitId = await repository.createCommit(
            'HEAD',
            GitProgramStorage.signature,
            GitProgramStorage.signature,
            message,
            treeId,
            [parentId]
        );

        if(tag)
            await repository.createTag(commitId, tag, message);

        return commitId.tostrS();
    }


    public getWorkingTree(programName: string): WorkingTree {
        return new WorkingTree(programName);
    }

    public async getWorkingTreeDirectory(programName: string, directoryPath: string): Promise<WorkingTreeDirectory> {
        directoryPath = GitProgramStorage.normalizePath(directoryPath);
        const absoluteDirectoryPath = this.getWorkingTreePath(programName, directoryPath);
        const items = await wrapCallbackAsPromise(fs.readdir, absoluteDirectoryPath);
        const directoryStats = await wrapCallbackAsPromise(fs.stat, absoluteDirectoryPath);

        return GitVersionControlFactory.createWorkingTreeDirectory(programName, directoryPath, directoryStats, items);
    }

    public async getWorkingTreeFile(programName: string, filePath: string): Promise<WorkingTreeFile> {
        filePath = GitProgramStorage.normalizePath(filePath);
        const stats = await wrapCallbackAsPromise(fs.stat, this.getWorkingTreePath(programName, filePath));

        if(!stats.isFile())
            throw new Error(`Target '${filePath}' is not a file.`);

        return GitVersionControlFactory.createWorkingTreeFile(programName, filePath, stats);
    }

    public getWorkingTreeFileContent(programName: string, filePath: string, encoding?: string): Promise<string> {
        encoding = encoding || 'utf-8';

        const absolutePath = this.getWorkingTreePath(programName, filePath);
        return wrapCallbackAsPromise(fs.readFile, absolutePath, encoding);
    }

    public async createWorkingTreeDirectory(programName: string, directoryPath: string, mode?: number) {
        const absoluteDirectoryPath = this.getWorkingTreePath(programName, directoryPath);
        await wrapCallbackAsPromise(fs.mkdir, absoluteDirectoryPath, mode);
    }

    public async createWorkingTreeFile(programName: string, filePath: string, content?: string, mode?: number) {
        content = content || '';

        const absoluteFilePath = this.getWorkingTreePath(programName, filePath);
        await wrapCallbackAsPromise(fs.writeFile, absoluteFilePath, content, {mode});
    }

    public async resetWorkingTree(programName: string) {
        let repository = await this.getRepository(programName);
        let headCommit = await repository.getHeadCommit();

        await NodeGit.Reset.reset(
            repository,
            <any>headCommit,
            NodeGit.Reset.TYPE.HARD,
            null);

        // basically, this does the same thing as git clean would do
        for(const file of <any[]> await repository.getStatus(null)) {
            if(!file.inIndex())
                await wrapCallbackAsPromise(rimraf, this.getWorkingTreePath(programName, file.path()));
        }
    }

    public updateWorkingTreeObject(programName: string, path: string, mode: number): void {
    }

    public deleteWorkingTreeFile(programName: string, path: string): void {
    }

    public deleteWorkingTreeDirectory(programName: string, path: string): void {
    }

    private getProgramPath(name: string) {
        return path.resolve(this.storagePath, name);
    }

    private getRepository(programName: string) {
        return NodeGit.Repository.open(this.getProgramPath(programName));
    }

    private getWorkingTreePath(programName: string, targetPath: string) {
        const programPath = this.getProgramPath(programName);
        let absolutePath = path.resolve(programPath, targetPath);

        // Check whether the target file is outside the working tree
        if(!absolutePath.startsWith(programPath))
            throw new Error(`Target '${targetPath}' is outside of working tree.`);

        return absolutePath;
    }
}
