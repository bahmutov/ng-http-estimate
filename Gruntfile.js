module.exports = function (grunt) {
  var pkg = grunt.file.readJSON('package.json');

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  var userConfig = {
    destination_dir: 'dist',

    app_files: {
      js: ['src/**/*.js']
    }
  };

  var taskConfig = {

    pkg: pkg,

    clean: ['<%= destination_dir %>/bower_components', 'tmp'],

    // make sure index.html example works inside destination folder
    copy: {
      all: {
        files: [
          {
            expand: true,
            src: [
              'bower_components/angular/angular.js',
              'bower_components/angular-mocks/angular-mocks.js',
              'index.html',
              'README.md'
            ],
            dest: '<%= destination_dir %>'
          }
        ]
      }
    },

    watch: {
      all: {
        options: {
          livereload: 35729
        },
        files: ['src/**/*.js', 'src/**/*.html', 'index.html'],
        tasks: ['build']
      }
    },

    'gh-pages': {
      options: {
        base: '<%= destination_dir %>'
      },
      src: [
        'index.html',
        'README.md',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'ng-http-estimate.js'
      ]
    }
  };
  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('build', ['clean', 'copy']);
  grunt.registerTask('default', ['sync', 'build']);
};
