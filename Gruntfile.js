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
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-symlink');

    grunt.registerTask('default', ['clean', 'ts', 'copy', 'symlink']);
};
