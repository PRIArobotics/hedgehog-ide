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

function getProgramResourceReply(name: string, creationDate: Date) {
    const id = new Buffer(name).toString('base64');
    return {
        type: 'program',
        id,
        attributes: {
            name,
            creationDate: creationDate.toISOString()
        },
        relationships: {
            versions: {
                links: {
                    related: `http://localhost:61749/api/versions/${id}`
                }
            },
            workingtree: {
                links: {
                    related: `http://localhost:61749/api/workingtrees/${id}`
                }
            }
        }
    };
}

describe('ProgramResource', () => {
    let server: Hapi.Server;
    let programResource: ProgramResource;
    let storage: IProgramStorage;
    let mock: Sinon.SinonMock;

    before(() => {
        programResource = new ProgramResource(null, modelRegistry);
        server = setupApiServer(programResource);
    });

    beforeEach(() => {
        storage = new GitProgramStorage(null);
        mock = sinon.mock(storage);
        (<any>programResource).programStorage = storage;
    });

    describe('createProgram', () => {
        it('should create a new program', (done) => {
            const creationDate = new Date();

            mock.expects('createProgram')
                .once()
                .returns(Promise.resolve(new Program(storage, 'program', 'version1')));

            mock.expects('getVersionIds')
                .returns(Promise.resolve(['version1']));

            mock.expects('getVersion')
                .returns(Promise.resolve(new Version(storage, 'program', 'version1', '', '', creationDate, [], '')));

            server.inject({
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
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 201);
                assert.deepEqual(JSON.parse(res.payload), {
                    links: {
                        self: 'http://localhost:61749/api/programs/cHJvZ3JhbQ=='
                    },
                    jsonapi: {
                        version: '1.0'
                    },
                    data: getProgramResourceReply('program', creationDate)
                });
                done();
            });
        });
    });

    describe('getProgram', () => {
        it('should load and return an existing program', (done) => {
            const creationDate = new Date();

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(new Program(storage, 'program1', 'version1')));

            mock.expects('getVersionIds')
                .returns(Promise.resolve(['version1']));

            mock.expects('getVersion')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'GET'
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    links: {
                        self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                    },
                    jsonapi: {
                        version: '1.0'
                    },
                    data: getProgramResourceReply('program1', creationDate)
                });
                done();
            });
        });
    });

    describe('getProgramList', () => {
        it('should return a list containing all programs stored on the controller', (done) => {
            const creationDate = new Date();

            mock.expects('getProgramNames')
                .once()
                .returns(Promise.resolve(['program1', 'program2']));

            mock.expects('getProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve(new Program(storage, 'program1', 'version1')));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version1')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            mock.expects('getProgram')
                .once()
                .withExactArgs('program2')
                .returns(Promise.resolve(new Program(storage, 'program2', 'version2')));
            mock.expects('getVersionIds')
                .withExactArgs('program2')
                .returns(Promise.resolve(['version2']));
            mock.expects('getVersion')
                .withExactArgs('program2', 'version2')
                .returns(Promise.resolve(new Version(storage, 'program2', 'version2', '', '', creationDate, [], '')));

            server.inject({
                url: '/api/programs',
                method: 'GET'
            }, (res) => {
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
                        getProgramResourceReply('program1', creationDate),
                        getProgramResourceReply('program2', creationDate)
                    ]
                });
                done();
            });
        });
    });

    describe('deleteProgram', () => {
        it('should delete a program', (done) => {
            mock.expects('deleteProgram')
                .once()
                .withExactArgs('program1')
                .returns(Promise.resolve());

            server.inject({
                url: '/api/programs/cHJvZ3JhbTE=',
                method: 'DELETE'
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 204);
                done();
            });
        });
    });

    describe('renameProgram', () => {
        it('should rename a program', (done) => {
            const creationDate = new Date();

            mock.expects('getProgram')
                .once()
                .withExactArgs('program2')
                .returns(Promise.resolve(new Program(storage, 'program2', 'version1')));
            mock.expects('getVersionIds')
                .withExactArgs('program1')
                .returns(Promise.resolve(['version1']));
            mock.expects('getVersion')
                .withExactArgs('program1', 'version1')
                .returns(Promise.resolve(new Version(storage, 'program1', 'version1', '', '', creationDate, [], '')));

            mock.expects('renameProgram')
                .once()
                .withExactArgs('program2', 'program1');

            server.inject({
                url: '/api/programs/cHJvZ3JhbTI=',
                method: 'PATCH',
                payload: {
                    data: {
                        type: 'program',
                        attributes: {
                            name: 'program1'
                        }
                    }
                }
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    links: {
                        self: 'http://localhost:61749/api/programs/cHJvZ3JhbTE='
                    },
                    jsonapi: {
                        version: '1.0'
                    },
                    data: getProgramResourceReply('program1', creationDate)
                });
                done();
            });
        });
    });
});
