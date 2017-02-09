import "babel-polyfill";
import assert = require('assert');
import JsonApiDocumentBuilder from "../../../src/server/jsonapi/JsonApiBuilder";
import {DataType} from "../../../src/server/jsonapi/JsonApiBuilder";
import {JsonApiResourceBuilder} from "../../../src/server/jsonapi/JsonApiBuilder";
import {JsonApiResource} from "../../../src/server/jsonapi/JsonApiObjects";

describe('JsonApiDocumentBuilder', () => {
    let documentBuilder: JsonApiDocumentBuilder;

    beforeEach(() => {
        documentBuilder = new JsonApiDocumentBuilder();
    });

    describe('getProduct', () => {
        it('should return the generated product', () => {
            let document = documentBuilder.getProduct();
            assert.deepEqual(document, {
                jsonapi: {
                    version: '1.0'
                }
            });
        });
    });

    describe('setDataType', () => {
        it('should set the data type to many resources', () => {
            documentBuilder.setDataType(DataType.Many);
            assert.deepEqual(documentBuilder.document.data, []);
        });

        it('should set the data type to single resource', () => {
            documentBuilder.setDataType(DataType.Single);
            assert.equal(documentBuilder.document.data, null);
        });
    });

    describe('getResourceBuilder', () => {
        it('should return a JsonApiResourceBuilder with the given document builder', () => {
            let resourceBuilder = documentBuilder.getResourceBuilder();
            assert.ok(resourceBuilder instanceof JsonApiResourceBuilder);
            assert.equal((resourceBuilder as any).documentBuilder, documentBuilder);
        });
    });

    describe('addResource', () => {
        it('should set the resource for single resource documents', () => {
            let resource = new JsonApiResource();
            resource.id = 'test';
            resource.type = 'test';
            documentBuilder.addResource(resource);

            assert.deepEqual(documentBuilder.document.data, {
                id: 'test',
                type: 'test'
            });
        });

        it('should add a resource for many resource documents', () => {
            documentBuilder.document.data = [];
            let resource1 = new JsonApiResource();
            resource1.id = 'test1';
            resource1.type = 'test1';
            documentBuilder.addResource(resource1);

            let resource2 = new JsonApiResource();
            resource2.id = 'test2';
            resource2.type = 'test2';
            documentBuilder.addResource(resource2);

            assert.deepEqual(documentBuilder.document.data, [
                {
                    id: 'test1',
                    type: 'test1'
                },
                {
                    id: 'test2',
                    type: 'test2'
                }
            ]);
        });
    });

    describe('addIncludedResource', () => {
        it('should add included resources', () => {
            let resource1 = new JsonApiResource();
            resource1.id = 'test1';
            resource1.type = 'test1';
            documentBuilder.addIncludedResource(resource1);

            let resource2 = new JsonApiResource();
            resource2.id = 'test2';
            resource2.type = 'test2';
            documentBuilder.addIncludedResource(resource2);

            assert.deepEqual(documentBuilder.document.included, [
                {
                    id: 'test1',
                    type: 'test1'
                },
                {
                    id: 'test2',
                    type: 'test2'
                },
            ]);
        });
    });
});
