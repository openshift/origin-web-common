module.exports = function (grunt) {
  'use strict';

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  function init () {

    grunt.initConfig({
      availabletasks: {
        tasks: {
          options: {
            descriptions: {
              'help': 'Task list helper for your Grunt enabled projects.',
              'clean': 'Deletes the content of the dist directory.',
              'build': 'Builds the project into the dist directory.',
              'test': 'Executes the karma testsuite.'
            },
            groups: {
              'Basic project tasks': ['help', 'clean', 'build', 'test']
            }
          }
        }
      },
      clean: {
        all: ['dist/*']
      },
      concat: {
        options: {
          separator: ';'
        },
        ui: {
          src: ['src/**/*UI.module.js', 'dist/scripts/templates.js', 'src/components/**/*.js', 'src/filters/**/*.js', 'src/ui-services/**/*.js'],
          dest: 'dist/origin-web-common-ui.js'
        },
        services: {
          src: ['src/**/*Services.module.js', 'src/services/**/*.js'],
          dest: 'dist/origin-web-common-services.js'
        },
        dist: {
          src: ['src/**/*.module.js', 'dist/scripts/templates.js', 'src/**/*.js'],
          dest: 'dist/origin-web-common.js'
        }
      },
      karma: {
        unit: {
          configFile: 'test/karma.conf.js',
          singleRun: true,
          browsers: ['PhantomJS']
        }
      },
      less: {
        production: {
          files: {
            'dist/origin-web-common.css': 'src/styles/main.less'
          },
          options: {
            cleancss: true,
            paths: ['src/styles', 'bower_components/']
          }
        }
      },
      htmlmin: {
        dist: {
          options: {
            preserveLineBreaks: true,
            collapseWhitespace: true,
            conservativeCollapse: false,
            collapseBooleanAttributes: false,
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: false,
            keepClosingSlash: true
          },
          files: [{
            expand: true,
            src: ['src/components/{,*/}*.html'],
            dest: 'dist'
          }]
        }
      },      // ng-annotate tries to make the code safe for minification automatically
      // by using the Angular long form for dependency injection.
      ngAnnotate: {
        dist: {
          files: [{
            src: 'dist/origin-web-common.js',
            dest: 'dist/origin-web-common.js'
          }]
        }
      },
      ngtemplates: {
        dist: {
          src: 'src/components/**/*.html',
          dest: 'dist/scripts/templates.js',
          options: {
            module: 'openshiftCommonUI',
            standalone: false,
            htmlmin: ''
          }
        }
      },
      uglify: {
        options: {
          mangle: false
        },
        build: {
          files: {},
          src: 'dist/origin-web-common.js',
          dest: 'dist/origin-web-common.min.js'
        }
      }
    });

    // You can specify which modules to build as arguments of the build task.
    grunt.registerTask('build', 'Create bootstrap build files', function () {
      grunt.task.run(['clean', 'ngtemplates', 'concat', 'ngAnnotate', 'less', 'uglify:build', 'test']);
    });

    // Runs all the tasks of build with the exception of tests
    grunt.registerTask('deploy', 'Prepares the project for deployment. Does not run unit tests', function () {
      grunt.task.run(['clean', 'ngtemplates', 'concat', 'ngAnnotate', 'less', 'uglify:build']);
    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('check', ['test']);
    grunt.registerTask('help', ['availabletasks']);
  }

  init({});

};
