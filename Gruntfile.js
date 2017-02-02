var fs   = require('fs');
var path = require('path');
var spec = require('swagger-tools').specs.v2;
var yaml = require('js-yaml');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            options: {
                target: 'es6',
                module: 'commonjs',
                moduleResolution: 'node',
                sourceMap: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                removeComments: false,
                noImplicitAny: false,
                rootDir: '.'
            },
            all: {
                src: ['src/**/*.ts', 'typings/index.d.ts'],
                outDir: 'build'
            },
            test: {
                src: ['test/**/*.ts', 'typings/index.d.ts'],
                outDir: 'build'
            }
        },
        babel: {
            options: {
                presets: ['es2015']
            },
            all: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: [
                        'src/**/*.js',
                        'test/**/*.js',
                        '!src/client/node_modules/*',
                        '!src/client/app/blockly/lib/*'
                    ],
                    dest: 'build'
                }]
            }
        },
        clean: [
            'build',
            'tmp'
        ],
        copy: {
            client: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: [
                            '**/*.html',
                            '**/*.css',
                            '**/*.svg',
                            'client/systemjs*.js',
                        ],
                        dest: 'build/src'
                    },

                    //blockly libs
                    {
                        expand: true,
                        cwd: 'src/client/app/blockly/lib',
                        src: ['**'],
                        dest: 'build/src/client/app/blockly/lib'
                    },

                    {
                        expand: true,
                        cwd: 'src/client/app/blockly/lib',
                        src: ['**'],
                        dest: 'build/dist/app/blockly/lib'
                    },

                    //google material files
                    {
                        expand: true,
                        cwd: 'src/client/assets/css/google-material',
                        src: ['**'],
                        dest: 'build/src/client/assets/css/google-material'
                    }
                ]
            }
        },
        tslint: {
            options: {
                configuration: "tslint.json"
            },
            server: 'src/server/**/*.ts',
            client: 'src/client/**/*.ts',
            common: 'src/common/**/*.ts',
            test: 'test/**/*.ts'
        },
        concurrent: {
            run: [['compile', 'copy', 'injector', 'run-server'], 'watch:compile', 'watch:copy'],
            options: {
                logConcurrentOutput: true
            }
        },
        watch: {
            copy: {
                files: ['src/**/*.html', 'src/**/*.css'],
                tasks: ['copy', 'injector'],
                options: {
                    interrupt: true
                }
            },
            compile: {
                files: 'src/**/*.ts',
                tasks: ['compile'],
                options: {
                    interrupt: true
                }
            }
        },
        injector: {
            options: {
                addRootSlash: false,
                ignorePath: 'build/src/client',
                transform: function (filepath) {
                    console.log(filepath);
                    return `<script src="${filepath}"></script>`;
                }
            },
            src: {
                files: {
                    'build/src/client/index.html': [
                        'node_modules/systemjs/dist/system.src.js',
                        'build/src/client/systemjs.config.js',
                        'build/src/client/systemjs-bootstrap.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-injector');

    grunt.registerTask('swagger-validate', function() {
        var done = this.async();
        var specObject = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'api_spec/swagger.yaml'), 'utf8'));

        // from https://github.com/apigee-127/swagger-tools/blob/master/docs/API.md#validaterlorso-apideclarations-callback
        spec.validate(specObject, function (err, result) {
            if (err) {
                done(err);
            }

            if (typeof result !== 'undefined') {
                if (result.warnings.length > 0) {
                    grunt.log.writeln('Warnings');
                    grunt.log.writeln('--------');

                    result.warnings.forEach(function (warn) {
                        grunt.log.writeln('#/' + warn.path.join('/') + ': ' + warn.message);
                    });
                }

                if (result.errors.length > 0) {
                    grunt.log.error('Errors');
                    grunt.log.error('------');

                    result.errors.forEach(function (err) {
                        grunt.log.error('#/' + err.path.join('/') + ': ' + err.message);
                    });

                    grunt.fail.fatal('The Swagger document is invalid.');
                    done(false);
                    return;
                }
            }
            grunt.log.ok('API specification is valid.');
            done();
        });
    });

    grunt.registerTask('run-server', function() {
        var options = {
            cmd: 'node',
            args: ['build/src/server/server.js']
        };

        var done = this.async();

        var nodetask = grunt.util.spawn(options, function doneFunction(error, result, code) {
            done()
        });

        nodetask.stdout.pipe(process.stdout);
        nodetask.stderr.pipe(process.stderr);
    });

    grunt.registerTask('compile', ['ts', 'babel']);
    grunt.registerTask('build', ['clean', 'compile', 'copy', 'injector']);
    grunt.registerTask('default', ['concurrent:run']);
};
