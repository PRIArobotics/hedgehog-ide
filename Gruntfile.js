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
                noImplicitAny: false
            },
            all: {
                src: ['src/**/*.ts', 'typings/index.d.ts'],
                outDir: 'build/src'
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
                    src: ['**/*.js', '!src/client/node_modules/*'],
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
                        src: ['**/*.html', '**/*.css', 'client/systemjs.config.js'],
                        dest: 'build/src'
                    }
                ]
            }
        },
        symlink: {
            client: {
                src: 'node_modules',
                dest: 'build/src/client/node_modules'
            }
        },
        tslint: {
            options: {
                configuration: "tslint.json"
            },
            server: 'src/server/**/*.ts',
            client: 'src/client/**/*.ts',
            versioncontrol: 'src/versioncontrol/**/*.ts',
            test: 'test/**/*.ts'
        },
        concurrent: {
            run: [['build', 'run-server'], 'watch:compile', 'watch:copy'],
            options: {
                logConcurrentOutput: true
            }
        },
        watch: {
            copy: {
                files: ['src/**/*.html', 'src/**/*.css'],
                tasks: ['copy'],
                options: {
                    interrupt: true
                }
            },
            compile: {
                files: 'src/**/*.ts',
                tasks: ['build'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-babel');

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
    grunt.registerTask('build', ['clean', 'compile', 'copy', 'symlink']);
    grunt.registerTask('default', ['concurrent:run']);
};
