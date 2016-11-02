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
        it('should create a new program', () => {
            let programName = getProgramName();

            return programStorage.createProgram(programName)
                .then((program: Program) => {
                    assert.equal(program.name, programName);

                    return NodeGit.Repository.open(`tmp/${programName}`);
                })
                .then((repository: NodeGit.Repository) => {
                    assert.equal(repository.isEmpty(), 0);

                    return repository.getHeadCommit();
                })
                .then((commit: NodeGit.Commit) => {
                    assert.equal(commit.message(), 'initial commit');
                });
        });
    });

    describe('deleteProgram', () => {
        it('should delete an existing program', () => {
            let programName = getProgramName();

            return NodeGit.Repository.init(`tmp/${programName}`, 0)
                .then(() => {
                    return programStorage.deleteProgram(programName);
                })
                .then(() => {
                    return wrapCallbackAsPromise(fs.stat, `tmp/${programName}`);
                })
                .then(() => {
                    throw Error('Program was not deleted.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOENT');
                });
        });

        it('should throw an error if the program does not exist', () => {
            return programStorage.deleteProgram(getProgramName())
                .then(() => {
                    throw Error('Operation failed silently.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOENT');
                });
        });

        it('should throw an error if the program directory is actually a file', () => {
            let programName = getProgramName();

            return wrapCallbackAsPromise(fs.writeFile, `tmp/${programName}`, '')
                .then(() => {
                    return programStorage.deleteProgram(programName);
                })
                .then(() => {
                    throw Error('Operation failed silently.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOTDIR');
                });
        });
    });

    describe('getProgramNames', () => {
        it('should list programs names', () => {
            let programNames = [getProgramName(), getProgramName()];

            return NodeGit.Repository.init(`tmp/${programNames[0]}`, 0)
                .then(() => {
                    return NodeGit.Repository.init(`tmp/${programNames[1]}`, 0);
                })
                .then(() => {
                    return programStorage.getProgramNames();
                })
                .then((names) => {
                    assert.deepEqual(names, programNames);
                });
        });
    });

    describe('getProgram', () => {
        it('should load an existing program', () => {
            let programName = getProgramName();

            return NodeGit.Repository.init(`tmp/${programName}`, 0)
                .then(() => {
                    return programStorage.getProgram(programName);
                })
                .then((program: Program) => {
                    assert.ok(program instanceof Program);
                    assert.equal(program.name, programName);
                });
        });
    });
});
