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

        it('should create an initial commit and the hedgehog', async () => {
            let programName = getProgramName();
            await programStorage.createProgram(programName);
            let repository = await NodeGit.Repository.open(`tmp/${programName}`);
            assert.equal(repository.isEmpty(), 0);

            let commit = await repository.getHeadCommit();
            assert.equal(commit.message(), 'initial commit');

            assert.equal((await repository.getBranchCommit('hedgehog')).id().tostrS(), commit.id().tostrS());
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
            const signature = NodeGit.Signature.now('Hedgehog', 'info@hedgehog.pria.at');
            let repository = await NodeGit.Repository.init(`tmp/${programName}`, 0);
            let commits = [
                (await repository.createCommitOnHead(
                    [],
                    signature,
                    signature,
                    'initial commit'
                )).tostrS(),
                (await repository.createCommitOnHead(
                    [],
                    signature,
                    signature,
                    'second commit'
                )).tostrS()
            ];
            await repository.createBranch('hedgehog', commits[1], false, signature, null);
            assert.deepEqual(await programStorage.getVersionIds(programName), commits.reverse());
        });
    });
});
