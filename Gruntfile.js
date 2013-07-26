module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['lib/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jscs: {
            files: ['lib/*.js'],
            options: {
                config: '.jscs.json'
            }
        },
        mochaTest: {
            files: ['test/*.js'],
            options: {
                bail: true,
                reporter: 'spec',
                ignoreLeaks: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint', 'jscs']);
    grunt.registerTask('test', ['mochaTest']);
};
