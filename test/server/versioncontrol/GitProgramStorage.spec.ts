import assert = require('assert');
import fs = require('fs');
import NodeGit = require('nodegit');

import GitProgramStorage from "../../../src/server/versioncontrol/GitProgramStorage";
import Program from "../../../src/server/versioncontrol/Program";
import {wrapCallbackAsPromise} from '../../../src/utils';

describe('GitProgramStorage', () => {
    let programStorage: GitProgramStorage;
    let programCounter = 0;
    let currentProgramName;

    before(() => {
        programStorage = new GitProgramStorage('./tmp');
    });

    beforeEach(() => {
        currentProgramName = `test-program-${programCounter}`;
        programCounter++;
    });

    describe('createProgram', () => {
        it('should create a new program', () => {
            return programStorage.createProgram(currentProgramName)
                .then((program: Program) => {
                    assert.equal(program.name, currentProgramName);

                    return NodeGit.Repository.open(`tmp/${currentProgramName}`);
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
            return NodeGit.Repository.init(`tmp/${currentProgramName}`, 0)
                .then(() => {
                    return programStorage.deleteProgram(new Program(currentProgramName));
                })
                .then(() => {
                    return wrapCallbackAsPromise(fs.stat, `tmp/${currentProgramName}`);
                })
                .then(() => {
                    throw Error('Program was not deleted.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOENT');
                });
        });

        it('should throw an error if the program does not exist', () => {
            return programStorage.deleteProgram(new Program(currentProgramName))
                .then(() => {
                    throw Error('Operation failed silently.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOENT');
                });
        });

        it('should throw an error if the program directory is actually a file', () => {
            return wrapCallbackAsPromise(fs.writeFile, `tmp/${currentProgramName}`, '')
                .then(() => {
                    return programStorage.deleteProgram(new Program(currentProgramName));
                })
                .then(() => {
                    throw Error('Operation failed silently.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOTDIR');
                });
        });
    });
});
