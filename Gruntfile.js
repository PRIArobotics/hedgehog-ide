var fs   = require('fs');
var path = require('path');
var spec = require('swagger-tools').specs.v2;
var yaml = require('js-yaml');

const webpackConfig = require('./src/client/webpack.prod');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            default: {
                tsconfig: {
                    passThrough: true
                }
            }
        },
        clean: [
            'build',
            'tmp'
        ],
        copy: {
            client: {
                files: [
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
                        cwd: 'src/client/assets',
                        src: ['**'],
                        dest: 'build/src/client/assets'
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

        // todo fix watch an concurrent
        concurrent: {
            run: [['compile', 'sass','copy', 'injector', 'run-server'], 'watch:compile', 'watch:copy'],
            options: {
                logConcurrentOutput: true
            }
        },
        watch: {
            copy: {
                files: ['src/**/*.html', 'src/**/*.css','src/client/app/blockly/lib/**'],
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
        webpack: {
            'dev-watch': Object.assign({watch: true}, require('./src/client/webpack.dev')),
            dev: require('./src/client/webpack.dev'),
            dist: webpackConfig
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-webpack');

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

    grunt.registerTask('build-dirty', ['ts', 'copy', 'webpack:dev']);
    grunt.registerTask('build', ['clean', 'build-dirty']);
    grunt.registerTask('default', ['concurrent:run']);
};
