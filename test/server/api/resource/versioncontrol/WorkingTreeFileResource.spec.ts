import "babel-polyfill";
import assert = require('assert');
import Hapi = require('hapi');
import sinon = require('sinon');

import {setupApiServer} from "../../testutils";
import WorkingTreeFileResource from "../../../../../src/server/api/resource/versioncontrol/WorkingTreeFileResource";
import IProgramStorage from "../../../../../src/common/versioncontrol/ProgramStorage";
import GitProgramStorage from "../../../../../src/server/versioncontrol/GitProgramStorage";
import modelRegistry from "../../../../../src/server/jsonapi/ModelSerializerRegistry";
import WorkingTreeFile from "../../../../../src/common/versioncontrol/WorkingTreeFile";

describe('WorkingTreeFileResource', () => {
    let server: Hapi.Server;
    let workingTreeFileResource: WorkingTreeFileResource;
    let storage: IProgramStorage;
    let mock: Sinon.SinonMock;

    before(() => {
        workingTreeFileResource = new WorkingTreeFileResource(null, modelRegistry);
        server = setupApiServer(workingTreeFileResource);
    });

    beforeEach(() => {
        storage = new GitProgramStorage(null);
        mock = sinon.mock(storage);
        (<any>workingTreeFileResource).programStorage = storage;
    });

    describe('createFile', () => {
        it('should create and return the newly created file', (done) => {
            mock.expects('createOrUpdateWorkingTreeFile')
                .withArgs('program1', 'testfile', 'Hello World!')
                .once()
                .returns(Promise.resolve());

            mock.expects('getWorkingTreeFile')
                .withExactArgs('program1', 'testfile')
                .returns(new WorkingTreeFile(storage, 'program1', 'testfile', 33188, 12));

            mock.expects('getWorkingTreeFileContent')
                .withExactArgs('program1', 'testfile')
                .returns('Hello World!');

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files',
                method: 'POST',
                payload: {
                    data: {
                        type: 'file',
                        attributes: {
                            path: 'testfile',
                            content: 'Hello World!'
                        }
                    }
                }
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 201);
                assert.deepEqual(JSON.parse(res.payload), {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        self: "http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU="
                    },
                    data: {
                        type: "file",
                        id: "dGVzdGZpbGU=",
                        attributes: {
                            path: "testfile",
                            mode: 33188,
                            content: "Hello World!",
                            encoding: "utf-8",
                            size: 12
                        },
                        relationships: {
                            workingtree: {
                                links: {
                                    related: "http://localhost:61749/api/directory/dGVzdGZpbGU="
                                }
                            }
                        }
                    }
                });
                done();
            });
        });
    });

    describe('getFile', () => {
        it('should return the requests working tree file', (done) => {
            mock.expects('getWorkingTreeFile')
                .withExactArgs('program1', 'testfile')
                .once()
                .returns(new WorkingTreeFile(storage, 'program1', 'testfile', 33188, 12));

            mock.expects('getWorkingTreeFileContent')
                .withExactArgs('program1', 'testfile')
                .once()
                .returns('Hello World!');

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU=',
                method: 'GET'
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        self: "http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU="
                    },
                    data: {
                        type: "file",
                        id: "dGVzdGZpbGU=",
                        attributes: {
                            path: "testfile",
                            mode: 33188,
                            content: "Hello World!",
                            encoding: "utf-8",
                            size: 12
                        },
                        relationships: {
                            workingtree: {
                                links: {
                                    related: "http://localhost:61749/api/directory/dGVzdGZpbGU="
                                }
                            }
                        }
                    }
                });
                done();
            });
        });
    });

    describe('deleteFile', () => {
        it('should delete an existing working tree file', (done) => {
            mock.expects('deleteWorkingTreeObject')
                .withExactArgs('program1', 'testfile')
                .once()
                .returns(Promise.resolve());

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU=',
                method: 'delete'
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 204);
                done();
            });
        });
    });

    describe('updateFile', () => {
        it('should rename a file', (done) => {
            mock.expects('updateWorkingTreeObject')
                .once()
                .withExactArgs('program1', 'testfile', {
                    newPath: 'new_testfile',
                    mode: undefined
                })
                .returns(Promise.resolve());

            mock.expects('getWorkingTreeFile')
                .withExactArgs('program1', 'new_testfile')
                .returns(new WorkingTreeFile(storage, 'program1', 'new_testfile', 33188, 12));

            mock.expects('getWorkingTreeFileContent')
                .withExactArgs('program1', 'new_testfile')
                .returns('Hello World!');

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU=',
                method: 'patch',
                payload: {
                    data: {
                        id: "dGVzdGZpbGU=",
                        type: "file",
                        attributes: {
                            path: "new_testfile"
                        }
                    }
                }
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        self: "http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/bmV3X3Rlc3RmaWxl"
                    },
                    data: {
                        type: "file",
                        id: "bmV3X3Rlc3RmaWxl",
                        attributes: {
                            path: "new_testfile",
                            mode: 33188,
                            content: "Hello World!",
                            encoding: "utf-8",
                            size: 12
                        },
                        relationships: {
                            workingtree: {
                                links: {
                                    related: "http://localhost:61749/api/directory/bmV3X3Rlc3RmaWxl"
                                }
                            }
                        }
                    }
                });
                done();
            });
        });

        it('should update the file\'s content', (done) => {
            mock.expects('createOrUpdateWorkingTreeFile')
                .withArgs('program1', 'testfile', 'Knock knock.')
                .once()
                .returns(Promise.resolve());

            mock.expects('getWorkingTreeFile')
                .withExactArgs('program1', 'testfile')
                .returns(new WorkingTreeFile(storage, 'program1', 'testfile', 33188, 12));

            mock.expects('getWorkingTreeFileContent')
                .withExactArgs('program1', 'testfile')
                .returns('Knock knock.');

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU=',
                method: 'patch',
                payload: {
                    data: {
                        id: "dGVzdGZpbGU=",
                        type: "file",
                        attributes: {
                            content: "Knock knock."
                        }
                    }
                }
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        self: "http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU="
                    },
                    data: {
                        type: "file",
                        id: "dGVzdGZpbGU=",
                        attributes: {
                            path: "testfile",
                            mode: 33188,
                            content: "Knock knock.",
                            encoding: "utf-8",
                            size: 12
                        },
                        relationships: {
                            workingtree: {
                                links: {
                                    related: "http://localhost:61749/api/directory/dGVzdGZpbGU="
                                }
                            }
                        }
                    }
                });
                done();
            });
        });

        it('should chmod the file', (done) => {
            mock.expects('updateWorkingTreeObject')
                .once()
                .withExactArgs('program1', 'testfile', {
                    newPath: undefined,
                    mode: 0o100666
                })
                .returns(Promise.resolve());

            mock.expects('getWorkingTreeFile')
                .withExactArgs('program1', 'testfile')
                .returns(new WorkingTreeFile(storage, 'program1', 'testfile', 0o100666, 12));

            mock.expects('getWorkingTreeFileContent')
                .withExactArgs('program1', 'testfile')
                .returns('Hello World!');

            server.inject({
                url: 'http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU=',
                method: 'patch',
                payload: {
                    data: {
                        id: "dGVzdGZpbGU=",
                        type: "file",
                        attributes: {
                            mode: 0o100666
                        }
                    }
                }
            }, (res) => {
                mock.verify();
                assert.equal(res.statusCode, 200);
                assert.deepEqual(JSON.parse(res.payload), {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        self: "http://localhost:61749/api/workingtrees/cHJvZ3JhbTE=/files/dGVzdGZpbGU="
                    },
                    data: {
                        type: "file",
                        id: "dGVzdGZpbGU=",
                        attributes: {
                            path: "testfile",
                            mode: 0o100666,
                            content: "Hello World!",
                            encoding: "utf-8",
                            size: 12
                        },
                        relationships: {
                            workingtree: {
                                links: {
                                    related: "http://localhost:61749/api/directory/dGVzdGZpbGU="
                                }
                            }
                        }
                    }
                });
                done();
            });
        });
    });
});
