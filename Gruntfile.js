module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            client: {
                src: ['src/**/*.ts'],
                dest: 'build',
                tsconfig: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['ts']);

};