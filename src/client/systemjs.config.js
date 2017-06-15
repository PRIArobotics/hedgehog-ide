/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        baseURL: 'node_modules',
        packageConfigPaths: [
            './node_modules/*/package.json',
            './node_modules/@angular/*/package.json'
        ],
        paths: {
            'app/': './app/',
            'common/': './common/'
        },
        map: {
            'socket.io-client': './node_modules/socket.io-client/dist/socket.io.slim.js',
            'materialize-css': './node_modules/materialize-css/dist/js/materialize.js',
            'babel-polyfill/dist/polyfill.js': './node_modules/babel-polyfill/dist/polyfill.js',
            'zone.js/dist/zone.js': './node_modules/zone.js/dist/zone.js',
            'reflect-metadata/Reflect.js': './node_modules/reflect-metadata/Reflect.js',
            'text': './systemjs-text-plugin.js',
            'chartjs-color': './node_modules/chartjs-color/index.js',
            'color-convert': './node_modules/color-convert/index.js',
            'sharedb/lib/client': './node_modules/sharedb/lib/client/index.js',
            'make-error': './node_modules/make-error/index.js'
        },
        packages: {
            'app': {
                main: './main.js',
                defaultExtension: 'js'
            },
            'common': {
                defaultExtension: 'js'
            },
            'app/*.html': {
                defaultExtension: false
            }
        },
        meta: {
            'materialize-css': { format: 'global' },
            'babel-polyfill/dist/polyfill.js': { format: 'global' },
            'zone.js/dist/zone.js': { format: 'global' },
            'reflect-metadata/Reflect.js': { format: 'global' },
            'jquery': { format: 'global' },
            'jquery-ui-dist/jquery-ui.js': { format: 'global' },
            'ace-builds/src-noconflict/ace.js': {
                format: 'global'
            },
            'ace-builds/src-noconflict/ext-language_tools.js': {
                format: 'global',
                deps: ['ace-builds/src-noconflict/ace.js']
            },
            'app/*.html': {
                loader: 'text'
            },
            'app/*.css': {
                loader: 'text'
            },
            'app/blockly/lib/blockly_compressed.js': {
                format: 'global'
            },
            'app/blockly/lib/blocks_compressed.js': {
                format: 'global',
                deps: ['./blocks_compressed.js']
            },
            'app/blockly/lib/python_compressed.js': {
                format: 'global',
                deps: ['./blocks_compressed.js']
            },
            'app/blockly/lib/blocks/hedgehog.js': {
                format: 'global',
                deps: ['../blocks_compressed.js']
            }
        },
        transpiler: 'systemjs-plugin-babel'
    });
})(this);