import assert = require('assert');
import GitProgramStorage from "../../../src/server/versioncontrol/GitProgramStorage";
import {Program} from "../../../src/server/versioncontrol/Program";

describe('GitProgramStorage', () => {
    let programStorage: GitProgramStorage;

    before(() => {
        programStorage = new GitProgramStorage('./tmp');
    });

    describe('createProgram', () => {
        it('should create a new program', () => {
            return programStorage.createProgram('test-program')
                .then((program: Program) => {
                    assert.equal(program.name, 'test-program');
                    assert.equal((<any>program).repository.isEmpty(), 1);
                });
        });
    });
});
