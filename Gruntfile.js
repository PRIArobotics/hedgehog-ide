var fs   = require('fs');
var path = require('path');
var spec = require('swagger-tools').specs.v2;
var yaml = require('js-yaml');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            client: {
                src: ['src/**/*.ts'],
                outDir: 'build',
                options: {
                    rootDir: 'src'
                },
                tsconfig: true
            }
        },
        clean: [
            'build'
        ],
        copy: {
            client: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.html', 'client/systemjs.config.js'],
                        dest: 'build'
                    }
                ]
            }
        },
        symlink: {
            client: {
                src: 'node_modules',
                dest: 'build/client/node_modules'
            }
        },
        tslint: {
            options: {
                configuration: "tslint.json",
            },
            server: {
                src: ['src/server/**/*.ts']
            },
            client: {
                src: ['src/client/**/*.ts']
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-symlink');

    grunt.registerTask('default', ['clean', 'ts', 'copy', 'symlink']);

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
    })
};
