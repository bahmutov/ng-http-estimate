module.exports = function (grunt) {
  var pkg = grunt.file.readJSON('package.json');

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  var userConfig = {
    destination_dir: 'dist',

    app_files: {
      js: ['src/**/*.js']
    },

    demoFiles: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'index.html',
      'screenshot.png',
      'README.md',
      'app.js',
      'ng-http-estimate.js',
      'ng-http-estimate.css',
      'examples/**/*.html',
      'examples/**/*.js',
      'examples/**/*.css'
    ]
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
            src: userConfig.demoFiles,
            dest: '<%= destination_dir %>'
          }
        ]
      }
    },

    'gh-pages': {
      options: {
        base: '<%= destination_dir %>'
      },
      src: userConfig.demoFiles
    }
  };
  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('build', ['clean', 'copy']);
  grunt.registerTask('default', ['sync', 'build']);
};
