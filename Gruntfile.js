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
        ]
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['ts']);
};