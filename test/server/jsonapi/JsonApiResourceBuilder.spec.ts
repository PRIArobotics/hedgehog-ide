import "babel-polyfill";
import assert = require('assert');
import {JsonApiResourceBuilder} from "../../../src/server/jsonapi/JsonApiBuilder";
import {JsonApiLinks, JsonApiResource} from "../../../src/server/jsonapi/JsonApiObjects";

describe('JsonApiResourceBuilder', () => {
    let resourceBuilder: JsonApiResourceBuilder;

    beforeEach(() => {
        resourceBuilder = new JsonApiResourceBuilder(<any>{ });
    });

    describe('getProduct', () => {
        it('should return the underlying resource', () => {
            resourceBuilder.resource.attributes = {
                test: 'test'
            };

            assert.deepEqual(resourceBuilder.getProduct(), {
                attributes: {
                    test: 'test'
                }
            });
        });
    });

    describe('addSingleRelationship', () => {
        it('should set the relationship links for not included relationships', () => {
            let relationshipLink = new JsonApiLinks();
            relationshipLink.related = 'test_link';

            resourceBuilder.addSingleRelationship('test', relationshipLink);
            assert.deepEqual(resourceBuilder.resource, {
                relationships: {
                    test: {
                        links: relationshipLink
                    }
                }
            });
        });

        it('should correctly set the relationship data and included data', () => {
            let documentBuilder = {
                included: [],
                addIncludedResource(resource) {
                    this.included.push(resource);
                }
            };
            (<any>resourceBuilder).documentBuilder = documentBuilder;

            let resource = new JsonApiResource();
            resource.id = 'testid';
            resource.type = 'testtype';
            resource.attributes = {
                test: 'test'
            };

            resourceBuilder.addSingleRelationship('test', resource);
            assert.deepEqual(resourceBuilder.resource.relationships, {
                test: {
                    data: {
                        id: 'testid',
                        type: 'testtype'
                    }
                }
            });

            assert.deepEqual(documentBuilder.included, [resource]);
        });
    });

    describe('addManyRelationship', () => {
        it('should set the relationship links for not included relationships', () => {
            let relationshipLink = new JsonApiLinks();
            relationshipLink.related = 'test_link';

            resourceBuilder.addManyRelationship('test', relationshipLink);
            assert.deepEqual(resourceBuilder.resource, {
                relationships: {
                    test: {
                        links: relationshipLink
                    }
                }
            });
        });

        it('should correctly set the relationship data and included data', () => {
            let documentBuilder = {
                included: [],
                addIncludedResource(resource) {
                    this.included.push(resource);
                }
            };
            (<any>resourceBuilder).documentBuilder = documentBuilder;

            let resource1 = new JsonApiResource();
            resource1.id = 'testid1';
            resource1.type = 'testtype1';
            resource1.attributes = {
                test: 'test1'
            };

            let resource2 = new JsonApiResource();
            resource2.id = 'testid2';
            resource2.type = 'testtype2';
            resource2.attributes = {
                test: 'test2'
            };

            resourceBuilder.addManyRelationship('test', [resource1, resource2]);
            assert.deepEqual(resourceBuilder.resource.relationships, {
                test: {
                    data: [
                        {
                            id: 'testid1',
                            type: 'testtype1'
                        },
                        {
                            id: 'testid2',
                            type: 'testtype2'
                        }
                    ]
                }
            });

            assert.deepEqual(documentBuilder.included, [resource1, resource2]);
        });
    });
});
