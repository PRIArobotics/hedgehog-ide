import fs = require('fs');
import path = require('path');
import rimraf = require('rimraf');
import NodeGit = require('nodegit');
import {ncp} from "ncp";

import {wrapCallbackAsPromise} from "../../common/utils";
import IProgramStorage from "../../common/versioncontrol/ProgramStorage";
import Program from "../../common/versioncontrol/Program";
import * as GitVersionControlFactory from './GitVersionControlFactory';
import Blob from "../../common/versioncontrol/Blob";
import Tree from "../../common/versioncontrol/Tree";
import Version from "../../common/versioncontrol/Version";
import WorkingTreeFile from "../../common/versioncontrol/WorkingTreeFile";
import WorkingTreeDirectory from "../../common/versioncontrol/WorkingTreeDirectory";
import {WorkingTreeObjectType} from "../../common/versioncontrol/WorkingTreeObject";

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

    public async createProgram(name: string, copyFrom?: string): Promise<Program> {
        if (copyFrom) {
            await NodeGit.Clone.clone(this.getProgramPath(copyFrom), this.getProgramPath(name));
            await wrapCallbackAsPromise(rimraf, path.join(this.getProgramPath(name), '.git'));
        }

        let repository = await NodeGit.Repository.init(this.getProgramPath(name), 0);
        const latestVersionId = await this.createVersionFromWorkingTree(name, 'initial commit');

        const isClean = (await repository.getStatus({})).length === 0;
        return new Program(this, name, latestVersionId, isClean);
    }

    public async deleteProgram(name: string): Promise<void> {
        await wrapCallbackAsPromise(fs.readdir, this.getProgramPath(name));
        await wrapCallbackAsPromise(rimraf, this.getProgramPath(name));
    }

    public getProgramNames(): Promise<string[]> {
        return wrapCallbackAsPromise(fs.readdir, this.storagePath);
    }

    public async getProgram(name: string): Promise<Program> {
        let repo = await NodeGit.Repository.open(this.getProgramPath(name));

        const isClean = (await repo.getStatus({})).length === 0;
        const latestVersionId = (await repo.getHeadCommit()).id().tostrS();

        return new Program(this, name, latestVersionId, isClean);
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

    public async resetProgram(programName: string, versionId: string): Promise<void> {
        let repository = await NodeGit.Repository.open(this.getProgramPath(programName));
        let commit = await repository.getCommit(versionId);

        // for whatever reason, TS does not recognize that Commit has all properties of Object as well
        await NodeGit.Reset.reset(repository, commit as any, NodeGit.Reset.TYPE.HARD, { });
        await this.cleanWorkingTree(programName, repository);
        return Promise.resolve();
    }

    public async getBlob(programName: string, blobId: string): Promise<Blob> {
        let repository = await NodeGit.Repository.open(this.getProgramPath(programName));
        return GitVersionControlFactory.createBlob(this, programName, await repository.getBlob(blobId));
    }

    public async getBlobContent(programName: string, blobId: string, encoding?: string): Promise<string> {
        encoding = encoding || 'utf-8';

        let repository = await this.getRepository(programName);
        let rawContent = (await repository.getBlob(blobId)).content();
        return rawContent.toString(encoding);
    }

    public async getTree(programName: string, treeId: string): Promise<Tree> {
        let repository = await this.getRepository(programName);
        return GitVersionControlFactory.createTree(this, programName, await repository.getTree(treeId));
    }

    public async getVersionIds(programName: string): Promise<string[]> {
        let branchCommit = await (await this.getRepository(programName)).getHeadCommit();

        return new Promise<string[]>((resolve, reject) => {
            let eventEmitter = branchCommit.history();

            eventEmitter.on('end', (commits: NodeGit.Commit[]) => {
                resolve(commits.map(commit => commit.id().tostrS()));
            });

            eventEmitter.on('error', reject);

            (eventEmitter as any).start();
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

        return GitVersionControlFactory.createVersion(this, programName, tag, versionCommit);
    }

    public async createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string> {
        let repository = await this.getRepository(programName);
        let index: any = await repository.index();
        await index.addAll();
        await index.write();
        const treeId: NodeGit.Oid = await index.writeTree();

        const headCommit = await repository.getHeadCommit();
        const commitId = await repository.createCommit(
            'HEAD',
            GitProgramStorage.signature,
            GitProgramStorage.signature,
            message,
            treeId,
            headCommit ? [headCommit.id()] : []
        );

        if(tag)
            await repository.createTag(commitId, tag, message);

        return commitId.tostrS();
    }

    public async getWorkingTreeDirectory(programName: string, directoryPath: string): Promise<WorkingTreeDirectory> {
        directoryPath = GitProgramStorage.normalizePath(directoryPath);
        const absoluteDirectoryPath = this.getWorkingTreePath(programName, directoryPath);
        const items = await wrapCallbackAsPromise(fs.readdir, absoluteDirectoryPath);
        const directoryStats = await wrapCallbackAsPromise(fs.stat, absoluteDirectoryPath);

        const itemStats = {};
        for(const itemName of items) {
            const itemPath = path.join(directoryPath, itemName);
            if((await wrapCallbackAsPromise(fs.stat, this.getWorkingTreePath(programName, itemPath))).isDirectory()) {
                itemStats[itemName] = WorkingTreeObjectType.Directory;
            } else {
                itemStats[itemName] = WorkingTreeObjectType.File;
            }
        }

        return GitVersionControlFactory.createWorkingTreeDirectory(
            this,
            programName,
            directoryPath,
            directoryStats,
            items,
            itemStats
        );
    }

    public async getWorkingTreeFile(programName: string, filePath: string): Promise<WorkingTreeFile> {
        filePath = GitProgramStorage.normalizePath(filePath);
        const stats = await wrapCallbackAsPromise(fs.stat, this.getWorkingTreePath(programName, filePath));

        if(!stats.isFile())
            throw new Error(`Target '${filePath}' is not a file.`);

        return GitVersionControlFactory.createWorkingTreeFile(this, programName, filePath, stats);
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

    public async createOrUpdateWorkingTreeFile(programName: string, filePath: string, content?: string, mode?: number) {
        content = content || '';

        const absoluteFilePath = this.getWorkingTreePath(programName, filePath);
        await wrapCallbackAsPromise(fs.writeFile, absoluteFilePath, content, {mode});
    }

    public async resetWorkingTree(programName: string) {
        let repository = await this.getRepository(programName);
        let headCommit = await repository.getHeadCommit();

        await NodeGit.Reset.reset(
            repository,
            headCommit as any,
            NodeGit.Reset.TYPE.HARD,
            null);

        await this.cleanWorkingTree(programName, repository);
    }

    public async updateWorkingTreeObject(programName: string,
                                         currentPath: string,
                                         options: {mode?: number, newPath?: string}): Promise<void> {
        const absolutePath = this.getWorkingTreePath(programName, currentPath);
        if(options.mode)
            await wrapCallbackAsPromise(fs.chmod, absolutePath, options.mode);

        if(options.newPath) {
            const newAbsolutePath = this.getWorkingTreePath(programName, options.newPath);
            await wrapCallbackAsPromise(fs.rename, absolutePath, newAbsolutePath);
        }
    }

    public async deleteWorkingTreeObject(programName: string, objectPath: string): Promise<void> {
        const absolutePath = this.getWorkingTreePath(programName, objectPath);
        await wrapCallbackAsPromise(rimraf, absolutePath);
    }

    public getWorkingTreePath(programName: string, targetPath: string) {
        const programPath = this.getProgramPath(programName);
        let absolutePath = path.resolve(programPath, targetPath);

        // Check whether the target file is outside the working tree
        if(!absolutePath.startsWith(programPath))
            throw new Error(`Target '${targetPath}' is outside of working tree.`);

        return absolutePath;
    }

    private async cleanWorkingTree (programName: string, repository: NodeGit.Repository) {
        // basically, this does the same thing as git clean would do
        for(const file of await repository.getStatus(null) as any[]) {
            if(!file.inIndex())
                await wrapCallbackAsPromise(rimraf, this.getWorkingTreePath(programName, file.path()));
        }
    }

    private getProgramPath(name: string) {
        const absolutePath = path.resolve(this.storagePath, name);

        if(!absolutePath.startsWith(path.resolve(this.storagePath)))
            throw new Error(`Target '${name}' is outside of the storage directory.`);
        return absolutePath;
    }

    private getRepository(programName: string) {
        return NodeGit.Repository.open(this.getProgramPath(programName));
    }
}
