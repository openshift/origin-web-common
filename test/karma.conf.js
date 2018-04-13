// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-09-12 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [

      // Load dependencies
      "node_modules/jquery/dist/jquery.js",
      "node_modules/lodash/lodash.js",
      "node_modules/compare-versions/index.js",
      "node_modules/angular/angular.js",
      'node_modules/angular-mocks/angular-mocks.js',
      "node_modules/angular-sanitize/angular-sanitize.js",
      "node_modules/js-logger/src/logger.js",
      "node_modules/angular-utf8-base64/angular-utf8-base64.js",
      "node_modules/urijs/src/URI.js",
      "node_modules/urijs/src/URITemplate.js",
      "node_modules/urijs/src/jquery.URI.js",
      "node_modules/urijs/src/URI.fragmentURI.js",

      // load fixtures before source
      'test/spec/fixtures/config.js',
      'test/spec/fixtures/constants.js',
      'test/spec/fixtures/api-discovery.js',

      // Load source files
      'src/pluginLoader.js',
      'src/*.module.js',
      'dist/scripts/templates.js',
      'src/constants/**/*.js',
      'src/filters/**/*.js',
      'src/services/**/*.js',
      'src/ui-services/**/*.js',
      'src/components/**/*.js',
      'test/spec/spec-helper.js',
      'test/spec/filters/**/*.js',
      'test/spec/services/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'junit', 'coverage'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'test/test-results.xml'
    },

    // web server port
    port: 9443,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      'src/filters/*.js': ['coverage'],
      'src/services/*.js': ['coverage'],
      'src/ui-services/*.js': ['coverage']
    }
  });
};
