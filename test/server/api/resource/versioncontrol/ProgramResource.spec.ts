import "babel-polyfill";
// import assert = require('assert');
import Hapi = require('hapi');
import Api from "../../../../../src/server/api/Api";
import ApiResource from "../../../../../src/server/api/ApiResource";
import ProgramsResource from "../../../../../src/server/api/resource/versioncontrol/ProgramsResource";
import GitProgramStorage from "../../../../../src/server/versioncontrol/GitProgramStorage";

function setupApiServer(...resources: ApiResource[]) {
    let server = new Hapi.Server();
    server.connection({
        host: 'localhost',
        port: 61749
    });

    let api = new Api(server, '/');
    for(const resource of resources) {
        api.registerEndpoint(resource);
    }
    return server;
}

describe.skip('ProgramResource', () => {
    let server: Hapi.Server;

    before(() => {
        const programResource = new ProgramsResource(new GitProgramStorage('tmp'));
        server = setupApiServer(programResource);
    });

    describe('createProgram', () => {
        it('should create a new program', (done) => {
            server.inject({
                url: '/programs',
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
                console.log(res.payload);
                done();
            });
        });
    });
});
