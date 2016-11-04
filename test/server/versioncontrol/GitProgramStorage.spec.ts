import "babel-polyfill";
import assert = require('assert');
import fs = require('fs');
import NodeGit = require('nodegit');

import GitProgramStorage from "../../../src/server/versioncontrol/GitProgramStorage";
import Program from "../../../src/versioncontrol/Program";
import {wrapCallbackAsPromise} from '../../../src/utils';
import rimraf = require("rimraf");

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
            let odb = await (await NodeGit.Repository.init(`tmp/${programName}`, 0)).odb();

            const data = 'hello';
            let oid = await odb.write(<any>data, data.length, NodeGit.Object.TYPE.BLOB);
            let blob = await programStorage.getBlob(programName, oid.tostrS());

            assert.equal(blob.id, oid.tostrS());
            assert.equal(blob.size, data.length);
        });
    });
});
