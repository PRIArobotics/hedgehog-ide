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
});
