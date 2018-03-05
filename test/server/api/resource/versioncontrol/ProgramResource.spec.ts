import "babel-polyfill";
import assert = require('assert');
import sinon = require('sinon');
import Hapi = require('hapi');

import ProgramResource from "../../../../../src/server/api/resource/versioncontrol/ProgramResource";
import Program from "../../../../../src/common/versioncontrol/Program";
import Version from "../../../../../src/common/versioncontrol/Version";
import GitProgramStorage from "../../../../../src/server/versioncontrol/GitProgramStorage";
import modelRegistry from "../../../../../src/server/jsonapi/ModelSerializerRegistry";
import IProgramStorage from "../../../../../src/common/versioncontrol/ProgramStorage";
import {setupApiServer} from "../../testutils";
import {genericToBase64} from "../../../../../src/common/utils";

function getProgramResourceReply(program: Program, creationDate: Date) {
    const id = new Buffer(program.name).toString('base64');
    return {
        type: 'program',
        id,
        attributes: {
            name: program.name,
            creationDate: creationDate.toISOString(),
            latestVersionId: program.latestVersionId,
            workingTreeClean: true
        },
        relationships: {
            versions: {
                links: {
                    related: `http://localhost:61749/api/versions/${id}`
                }
            },
            latestVersion: {
                links: {
                    related: `http://localhost:61749/api/versions/${id}/${program.latestVersionId}`
                }
            },
            workingTreeRoot: {
                links: {
                    related: `http://localhost:61749/api/directories/${id}/${genericToBase64('.')}`
                }
            },
        }
    };
}

describe('ProgramResource', () => {
    let server: Hapi.Server;
    let programResource: ProgramResource;
    let storage: IProgramStorage;
    let mock: sinon.SinonMock;

    before(() => {
        programResource = new ProgramResource(null, modelRegistry);
        server = setupApiServer(programResource);
    });

    beforeEach(() => {
        storage = new GitProgramStorage(null);
        mock = sinon.mock(storage);
        (programResource as any).programStorage = storage;
    });

    describe('createProgram', () => {
        it('should create a new program', async () => {
            const creationDate = new Date();
            let program = new Program(storage, 'program', 'version1', true);

            mock.expects('createProgram')
                .once()
                .returns(Promise.resolve(program));

            mock.expects('getVersionIds')
                .returns(Promise.resolve(['version1']));

            mock.expects('getVersion')
                .returns(Promise.resolve(new Version(storage, 'program', 'version1', '', '', creationDate, [], '')));

            const res = await server.inject({
                url: '/api/programs',
                method: 'POST',
                payload: {
                    data: {
                        type: 'program',
                        attributes: {
                            name: 'program'
                        }
                    }
                }
            });
            mock.verify();
            assert.equal(res.statusCode, 201);
            assert.deepEqual(JSON.parse(res.payload), {
                links: {
                    self: 'http://localhost:61749/api/programs/cHJvZ3JhbQ=='
                },
                jsonapi: {
                    version: '1.0'
                },
                data: getProgramResourceReply(program, creationDate)
            });

        });
    });

    describe('getProgram', () => {
        it('should load and return an existing program', async () => {
            const creationDate = new Date();
            let program = new Program(storage, 'program1', 'version1', true);

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(program));

            mock.expects('getVersionIds')
                .returns(Promise.resolve(['version1']));

            mock.expects('getVersion')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            const res = await server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'GET'
            });
            mock.verify();
            assert.equal(res.statusCode, 200);
            assert.deepEqual(JSON.parse(res.payload), {
                links: {
                    self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                },
                jsonapi: {
                    version: '1.0'
                },
                data: getProgramResourceReply(program, creationDate)
            });
        });
    });

    describe('getProgramList', () => {
        it('should return a list containing all programs stored on the controller', async () => {
            const creationDate = new Date();
            let program1 = new Program(storage, 'program1', 'version1', true);
            let program2 = new Program(storage, 'program2', 'version2', true);

            mock.expects('getProgramNames')
                .once()
                .returns(Promise.resolve(['program1', 'program2']));

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(program1));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version1')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            mock.expects('getProgram')
                .once()
                .withExactArgs('program2')
                .returns(Promise.resolve(program2));
            mock.expects('getVersionIds')
                .withExactArgs('program2')
                .returns(Promise.resolve(['version2']));
            mock.expects('getVersion')
                .withExactArgs('program2', 'version2')
                .returns(Promise.resolve(new Version(storage, 'program2', 'version2', '', '', creationDate, [], '')));

            const res = await server.inject({
                url: '/api/programs',
                method: 'GET'
            });
            mock.verify();
            assert.equal(res.statusCode, 200);
            assert.deepEqual(JSON.parse(res.payload),{
                links: {
                    self: 'http://localhost:61749/api/programs'
                },
                jsonapi: {
                    version: '1.0'
                },
                data: [
                    getProgramResourceReply(program1, creationDate),
                    getProgramResourceReply(program2, creationDate)
                ]
            });
        });
    });

    describe('deleteProgram', () => {
        it('should delete a program', async () => {
            mock.expects('deleteProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve());

            const res = await server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'DELETE'
            });
            mock.verify();
            assert.equal(res.statusCode, 204);
        });
    });

    describe('updateProgram', () => {
        it('should rename a program', async () => {
            const creationDate = new Date();
            let program = new Program(storage, 'program2', 'version1', true);

            mock.expects('getProgram')
                .once()
                .withExactArgs('program2')
                .returns(Promise.resolve(program));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version1')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            mock.expects('renameProgram')
                .once()
                .withExactArgs('program2', 'program1');

            const res = await server.inject({
                url: '/api/programs/cHJvZ3JhbTI=',
                method: 'PATCH',
                payload: {
                    data: {
                        id: 'cHJvZ3JhbTE=',
                        type: 'program',
                        attributes: {
                            name: 'program1'
                        }
                    }
                }
            });
            mock.verify();
            assert.equal(res.statusCode, 200);
            assert.deepEqual(JSON.parse(res.payload), {
                links: {
                    self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                },
                jsonapi: {
                    version: '1.0'
                },
                data: getProgramResourceReply(program, creationDate)
            });
        });

        it('should reset a programs working tree', async () => {
            const creationDate = new Date();
            let program = new Program(storage, 'program1', 'version1', false);

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(program));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version1')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            mock.expects('resetWorkingTree')
                .once()
                .withExactArgs('program1');

            const res = await server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'PATCH',
                payload: {
                    data: {
                        id: 'cHJvZ3JhbTE=',
                        type: 'program',
                        attributes: {
                            workingTreeClean: true
                        }
                    }
                }
            });
            mock.verify();
            assert.equal(res.statusCode, 200);
            assert.deepEqual(JSON.parse(res.payload), {
                links: {
                    self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                },
                jsonapi: {
                    version: '1.0'
                },
                data: getProgramResourceReply(program, creationDate)
            });
        });

        it('should reset the program', async () => {
            const creationDate = new Date();
            let program = new Program(storage, 'program1', 'version2', true);

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(program));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1', 'version2']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version2')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version2', '', '', creationDate, [], '')));

            mock.expects('resetProgram')
                .once()
                .withExactArgs('program1', 'version1');

            const res = await server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'PATCH',
                payload: {
                    data: {
                        id: 'cHJvZ3JhbTE=',
                        type: 'program',
                        attributes: {
                            latestVersionId: 'version1'
                        }
                    }
                }
            });
            mock.verify();
            assert.equal(res.statusCode, 200);
            program.latestVersionId = 'version1';
            assert.deepEqual(JSON.parse(res.payload), {
                links: {
                    self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                },
                jsonapi: {
                    version: '1.0'
                },
                data: getProgramResourceReply(program, creationDate)
            });
        });
    });
});
