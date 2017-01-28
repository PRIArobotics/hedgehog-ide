/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        defaultJSExtensions: true,
        packageConfigPaths: [
            './node_modules/*/package.json',
            './node_modules/@angular/*/package.json'
        ],
        paths: {
            '*': './node_modules/*',
            'app': 'app/',
            'app/*': 'app/*',
            'vendor': 'vendor',
            'main': 'main',
        },
        map: {
            'socket.io-client': './node_modules/socket.io-client/dist/socket.io.min.js',
            'materialize-css': './node_modules/materialize-css/dist/js/materialize',
        },
        meta: {
            'materialize-css': { format: 'global' },
            'babel-polyfill/dist/polyfill': { format: 'global' },
            'zone.js/dist/zone': { format: 'global' },
            'reflect-metadata/Reflect': { format: 'global' },
            'jquery': { format: 'global' },
            'jquery-ui-dist/jquery-ui': { format: 'global' },
            'ace-builds/src-noconflict/ace': {
                format: 'global'
            },
            'ace-builds/src-noconflict/ext-language_tools': { format: 'global', deps: ['ace-builds/src-noconflict/ace'] }
        }
    });
})(this);