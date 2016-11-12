import "babel-polyfill";
import assert = require('assert');
import fs = require('fs');
import NodeGit = require('nodegit');

import GitProgramStorage from "../../../src/server/versioncontrol/GitProgramStorage";
import Program from "../../../src/versioncontrol/Program";
import {wrapCallbackAsPromise} from '../../../src/utils';
import rimraf = require("rimraf");
import {TreeItemType} from "../../../src/versioncontrol/Tree";

describe('GitProgramStorage', () => {
    let programStorage: GitProgramStorage;
    let programCounter = 0;

    function getProgramName() {
        let name = `test-program-${programCounter}`;
        programCounter++;
        return name;
    }

    beforeEach(() => {
        programStorage = new GitProgramStorage('./tmp');
        programCounter = 0;
        return wrapCallbackAsPromise(fs.mkdir, './tmp');
    });

    afterEach(() => {
        return wrapCallbackAsPromise(rimraf, './tmp');
    });

    describe('createProgram', () => {
        it('should create a new program', async () => {
            let programName = getProgramName();

            let program = await programStorage.createProgram(programName);
            assert.equal(program.name, programName);
        });

        it('should create an initial commit', async () => {
            let programName = getProgramName();
            await programStorage.createProgram(programName);
            let repository = await NodeGit.Repository.open(`tmp/${programName}`);
            assert.equal(repository.isEmpty(), 0);

            let commit = await repository.getHeadCommit();
            assert.equal(commit.message(), 'initial commit');
        });
    });

    describe('deleteProgram', () => {
        it('should delete an existing program', async () => {
            let programName = getProgramName();

            await NodeGit.Repository.init(`tmp/${programName}`, 0);
            await programStorage.deleteProgram(programName);
            try {
                await wrapCallbackAsPromise(fs.stat, `tmp/${programName}`);
                throw Error('Program was not deleted.');
            } catch(err) {
                assert.equal(err.code, 'ENOENT');
            }
        });

        it('should throw an error if the program does not exist', async () => {
            try {
                await programStorage.deleteProgram(getProgramName());
                throw Error('Operation failed silently.');
            } catch(err) {
                assert.equal(err.code, 'ENOENT');
            }
        });

        it('should throw an error if the program directory is actually a file', async () => {
            let programName = getProgramName();

            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}`, '');
            try {
                await programStorage.deleteProgram(programName);
                throw Error('Operation failed silently.');
            } catch(err) {
                assert.equal(err.code, 'ENOTDIR');
            }
        });
    });

    describe('getProgramNames', () => {
        it('should list programs names', async () => {
            let programNames = [getProgramName(), getProgramName()];

            await Promise.all([
                NodeGit.Repository.init(`tmp/${programNames[0]}`, 0),
                NodeGit.Repository.init(`tmp/${programNames[1]}`, 0)
            ]);

            let names = await programStorage.getProgramNames();
            assert.deepEqual(names, programNames);
        });
    });

    describe('getProgram', () => {
        it('should load an existing program', async () => {
            let programName = getProgramName();

            await NodeGit.Repository.init(`tmp/${programName}`, 0);

            let program = await programStorage.getProgram(programName);
            assert.ok(program instanceof Program);
            assert.equal(program.name, programName);
        });
    });

    describe('renameProgram', () => {
        it('should rename an existing program', async () => {
            let oldName = getProgramName();
            let newName = getProgramName();

            await NodeGit.Repository.init(`tmp/${oldName}`, 0);
            await programStorage.renameProgram(oldName, newName);

            try {
                await wrapCallbackAsPromise(fs.stat, `tmp/${oldName}`);
                throw Error('Old program still exists.');
            } catch(err) {
                assert.equal(err.code, 'ENOENT');
                let stats = await wrapCallbackAsPromise(fs.stat, `tmp/${newName}`);
                assert.ok(stats.isDirectory());
            }
        });

        it('should return an error if a program with the new name already exists', async () => {
            let oldName = getProgramName();
            let newName = getProgramName();

            await Promise.all([
                NodeGit.Repository.init(`tmp/${oldName}`, 0),
                NodeGit.Repository.init(`tmp/${newName}`, 0)
            ]);

            try {
                await programStorage.renameProgram(oldName, newName);
                throw Error('Program with new name overwritten.');
            } catch(err) {
                assert.equal(err.message, `Program "${newName}" already exists.`);
            }
        });
    });

    describe('getBlob', () => {
        it('should read an existing blob', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);

            let oid = await NodeGit.Blob.createFromBuffer(repository, Buffer.from('hello'), 5);
            let blob = await programStorage.getBlob(programName, oid.tostrS());

            assert.equal(blob.id, oid.tostrS());
            assert.equal(blob.size, 5);
        });
    });

    describe('getBlobContent', () => {
        it('should load the blob\'s content', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);

            let oid = await NodeGit.Blob.createFromBuffer(repository, Buffer.from('hello'), 5);

            let content = await programStorage.getBlobContent(programName, oid.tostrS());
            assert.equal(content, 'hello');
        });
    });

    describe('getTree', () => {
        it('should read a tree', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);

            const blobId = await NodeGit.Blob.createFromBuffer(repository, Buffer.from('hello'), 5);
            let treebuilder = await NodeGit.Treebuilder.create(repository, null);
            await treebuilder.insert('test', blobId, 0o100644);
            const treeId = await treebuilder.write();

            let tree = await programStorage.getTree(programName, treeId.tostrS());
            assert.equal(tree.id, treeId.tostrS());
            assert.equal((<any> tree).programName, programName);

            const expectedTreeItem = {
                type: TreeItemType.Blob,
                id: blobId.tostrS(),
                mode: 0o100644
            };
            assert.equal(tree.items.size, 1);
            assert.deepEqual(tree.items.get('test'), expectedTreeItem);
        });
    });

    describe('getVersionIds', () => {
        it('should return an array of all version ids', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let commits = [
                (await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'initial commit'
                )).tostrS(),
                (await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'second commit'
                )).tostrS()
            ];
            await repository.createBranch('hedgehog', commits[1], false, GitProgramStorage.signature, null);
            assert.deepEqual(await programStorage.getVersionIds(programName), commits.reverse());
        });
    });

    describe('getVersion', () => {
        it('should retrieve a version by it\'s commit id', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let commit = await repository.createCommitOnHead(
                [],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );

            await repository.createTag(commit, 'v1.0', 'foo');

            let version = await programStorage.getVersion(programName, commit.tostrS());
            assert.ok(version.creationDate instanceof Date);
            assert.equal(version.id, commit.tostrS());
            assert.equal(version.message, 'initial commit');
            assert.equal(version.tag, 'v1.0');
        });

        it('should retrieve a version by it\'s commit id without a tag', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let commits = [
                await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'initial commit'
                ),
                await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'second commit'
                )
            ];

            await repository.createTag(commits[1], 'v1.0', 'foo');

            let version = await programStorage.getVersion(programName, commits[0].tostrS());
            assert.equal(version.tag, null);
        });

        it('should retrieve a version\'s parent ids', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let commits = [
                await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'initial commit'
                ),
                await repository.createCommitOnHead(
                    [],
                    GitProgramStorage.signature,
                    GitProgramStorage.signature,
                    'second commit'
                )
            ];

            let version = await programStorage.getVersion(programName, commits[1].tostrS());
            assert.deepEqual(version.parentIds, [commits[0].tostrS()]);
        });
    });

    describe('createVersionFromWorkingTree', () => {
        it('should save the version by creating a commit', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let firstCommitId = await repository.createCommitOnHead(
                [],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );

            let versionId = await programStorage.createVersionFromWorkingTree(programName, 'test', 'v1.0');
            let commit = await repository.getCommit(versionId);
            assert.equal(commit.message(), 'test');
            assert.deepEqual(commit.parentId(0), firstCommitId);
        });

        it('should save the working tree correctly', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            await repository.createCommitOnHead(
                [],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );

            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test1`, 'hello');
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}/testdir`);
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/testdir/test2`, 'hello2');

            let versionId = await programStorage.createVersionFromWorkingTree(programName, 'test', 'v1.0');
            let tree = await (await repository.getCommit(versionId)).getTree();

            let test1File = await tree.getEntry('test1');
            assert.ok(test1File.isBlob());
            let test1Content = (await test1File.getBlob()).toString();
            assert.equal(test1Content, 'hello');

            let testDir = await tree.getEntry('testdir');
            assert.ok(testDir.isTree());

            let test2File = await (await testDir.getTree()).getEntry('test2');
            assert.ok(test2File.isBlob());
            let test2Content = (await test2File.getBlob()).toString();
            assert.equal(test2Content, 'hello2');
        });

        it('should create the specified tag', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            await repository.createCommitOnHead(
                [],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );

            let versionId = await programStorage.createVersionFromWorkingTree(programName, 'test', 'v1.0');
            let tag = await repository.getTagByName('v1.0');
            assert.equal(tag.targetId().tostrS(), versionId);
            assert.equal(tag.message(), 'test');
        });
    });

    describe('getWorkingTreeDirectory', () => {
        it('should get a directory from the working tree', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            let directory = await programStorage.getWorkingTreeDirectory(programName, '.');
            assert.equal(directory.path, '.');
        });

        it('should load the directory\'s items correctly', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test1`, 'test1');
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}/test2`);
            let directory = await programStorage.getWorkingTreeDirectory(programName, '.');
            assert.deepEqual(directory.items, ['test1', 'test2']);
        });

        it('should normalize the directory\'s path', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            let directory = await programStorage.getWorkingTreeDirectory(programName, './');
            assert.equal(directory.path, '.');

            directory = await programStorage.getWorkingTreeDirectory(programName, '');
            assert.equal(directory.path, '.');
        });

        it('should throw in error if a directory outside the working tree is targeted', async () => {
            const programName = getProgramName();
            const foreignProgramName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${foreignProgramName}`);

            try {
                await programStorage.getWorkingTreeDirectory(programName, `../${foreignProgramName}`);
                throw new Error('Directory access outside working tree allowed.');
            } catch(err) {
                assert.equal(err.message, `Target '../${foreignProgramName}' is outside of working tree.`);
            }
        });

        it('should throw in error if the target is not a directory', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}`, 'test1');

            try {
                await programStorage.getWorkingTreeDirectory(programName, `tmp/${programName}`);
                throw new Error('Directory access fails silently.');
            } catch(err) {
                assert.equal(err.code, 'ENOTDIR');
            }
        });
    });

    describe('getWorkingTreeFile', () => {
        it('should load a file from the working tree', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test1`, 'test1');

            let file = await programStorage.getWorkingTreeFile(programName, 'test1');
            assert.equal(file.path, 'test1');
            assert.equal(file.size, 5);
        });

        it('should normalize the file\'s path', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test1`, 'test1');

            let file = await programStorage.getWorkingTreeFile(programName, './test1');
            assert.equal(file.path, 'test1');
        });

        it('should throw in error if a directory outside the working tree is targeted', async () => {
            const programName = getProgramName();
            const foreignProgramName = getProgramName();
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${foreignProgramName}`, 'test1');

            try {
                await programStorage.getWorkingTreeFile(programName, `../${foreignProgramName}`);
                throw new Error('Directory access outside working tree allowed.');
            } catch(err) {
                assert.equal(err.message, `Target '../${foreignProgramName}' is outside of working tree.`);
            }
        });

        it('should throw in error if the target is not a file', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}/test`);

            try {
                await programStorage.getWorkingTreeFile(programName, 'test');
                throw new Error('Directory access fails silently.');
            } catch(err) {
                assert.equal(err.message, `Target 'test' is not a file.`);
            }
        });
    });

    describe('getWorkingTreeFileContent', () => {
        it('should load a file\'s content', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test`, 'hello');

            let content = await programStorage.getWorkingTreeFileContent(programName, 'test');
            assert.equal(content, 'hello');
        });
    });

    describe('createWorkingTreeDirectory', () => {
        it('should create a directory within the working tree', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            await programStorage.createWorkingTreeDirectory(programName, 'test');

            let stats = await wrapCallbackAsPromise(fs.stat, `tmp/${programName}/test`);
            assert.ok(stats.isDirectory());
        });

        it('should set the mode of the created directory', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            await programStorage.createWorkingTreeDirectory(programName, 'test', 0o700);

            let stats = await wrapCallbackAsPromise(fs.stat, `tmp/${programName}/test`);
            assert.ok(stats.isDirectory());
            assert.equal(stats.mode, 0o40700);
        });
    });

    describe('createWorkingTreeFile', () => {
        it('should create a file within the working tree', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            await programStorage.createWorkingTreeFile(programName, 'test');

            let stats = await wrapCallbackAsPromise(fs.stat, `tmp/${programName}/test`);
            assert.ok(stats.isFile());
        });

        it('should write the file content correctly', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            await programStorage.createWorkingTreeFile(programName, 'test', 'hello');

            let content = await wrapCallbackAsPromise(fs.readFile, `tmp/${programName}/test`);
            assert.equal(content, 'hello');
        });

        it('should set the mode of the created directory', async () => {
            const programName = getProgramName();
            await wrapCallbackAsPromise(fs.mkdir, `tmp/${programName}`);

            await programStorage.createWorkingTreeFile(programName, 'test', '', 0o600);

            let stats = await wrapCallbackAsPromise(fs.stat, `tmp/${programName}/test`);
            assert.equal(stats.mode, 0o100600);
        });
    });

    describe('resetWorkingTree', () => {
        it('should reset index and tracked files', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);

            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test`, 'hello');
            await repository.createCommitOnHead(
                ['test'],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test`, 'test');

            await programStorage.resetWorkingTree(programName);

            let diff = await NodeGit.Diff.treeToWorkdirWithIndex(
                repository,
                await (await repository.getHeadCommit()).getTree(),
                null);
            assert.equal(diff.numDeltas(), 0);
        });

        it('should reset untracked files', async () => {
            const programName = getProgramName();
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);

            await repository.createCommitOnHead(
                [],
                GitProgramStorage.signature,
                GitProgramStorage.signature,
                'initial commit'
            );
            await wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}/test`, 'hello');

            await programStorage.resetWorkingTree(programName);

            try {
                console.log(await wrapCallbackAsPromise(fs.stat, `tmp/${programName}/test`));
                throw new Error('File was not deleted.');
            } catch(err) {
                assert.equal(err.code, 'ENOENT');
            }
        });
    });
});
