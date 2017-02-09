import assert = require('assert');

import { basename } from '../src/common/utils';
import { dirname } from '../src/common/utils';
import { join } from '../src/common/utils';

describe('Utils', () => {
    describe('basename', () => {
        it('should return path without /\'s', () => {
            let path = basename('../src/utils.ts');
            assert.equal('utils.ts', path);
        });

        it('should return given path', () => {
            let path = basename('utils.ts');
            assert.equal('utils.ts', path);
        });
    });

    describe('dirname', () => {
        it('should return path without filename', () => {
            let path = dirname('../src/utils.ts');
            assert.equal('../src', path);
        });

        it('should return .', () => {
            let path = dirname('utils.ts');
            assert.equal('.', path);
        });
    });

    describe('join', () => {
        it('should return joint paths', () => {
            let path = join('../src/utils/', '/path/', '/join/');
            assert.equal('../src/utils/path/join', path);
        });

        it('should return joint paths with / at beginning', () => {
            let path = join('/src/utils/', '/path/', '/join/');
            assert.equal('/src/utils/path/join', path);
        });
    });
});
