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

    describe('renameProgram', () => {
        it('should rename an existing program', () => {
            let oldName = getProgramName();
            let newName = getProgramName();

            return NodeGit.Repository.init(`tmp/${oldName}`, 0)
                .then(() => {
                    return programStorage.renameProgram(oldName, newName);
                })
                .then(() => {
                    return wrapCallbackAsPromise(fs.stat, `tmp/${oldName}`);
                })
                .then(() => {
                    throw Error('Old program still exists.');
                })
                .catch((err) => {
                    assert.equal(err.code, 'ENOENT');
                    return wrapCallbackAsPromise(fs.stat, `tmp/${newName}`);
                })
                .then((stats: fs.Stats) => {
                    assert.ok(stats.isDirectory());
                });
        });

        it('should return an error if a program with the new name already exists', () => {
            let oldName = getProgramName();
            let newName = getProgramName();

            return NodeGit.Repository.init(`tmp/${oldName}`, 0)
                .then(() => {
                    return NodeGit.Repository.init(`tmp/${newName}`, 0);
                })
                .then(() => {
                    return programStorage.renameProgram(oldName, newName);
                })
                .then(() => {
                    throw Error('Program with new name overwritten.');
                })
                .catch((err) => {
                    assert.equal(err.message, `Program "${newName}" already exists.`);
                });
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
