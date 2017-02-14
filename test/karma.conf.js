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
      "bower_components/jquery/dist/jquery.js",
      "bower_components/lodash/lodash.js",
      "bower_components/angular/angular.js",
      'bower_components/angular-mocks/angular-mocks.js',
      "bower_components/angular-sanitize/angular-sanitize.js",
      "bower_components/js-logger/src/logger.js",
      "bower_components/messenger/build/js/messenger.js",
      "bower_components/angular-utf8-base64/angular-utf8-base64.js",
      "bower_components/uri.js/src/URI.js",
      "bower_components/uri.js/src/URITemplate.js",
      "bower_components/uri.js/src/jquery.URI.js",
      "bower_components/uri.js/src/URI.fragmentURI.js",
      "bower_components/hawtio-core/hawtio-core.js",
      "bower_components/kubernetes-container-terminal/dist/container-terminal.js",
      "bower_components/hawtio-extension-service/dist/hawtio-extension-service.js",
      'src/**/*.js',
      'test/spec/spec-helper.js',
      'test/spec/fixtures/api-discovery.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'junit'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'test/test-results.xml'
    },

    // web server port
    port: 8443,


    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
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
    reportSlowerThan: 500
  });
};
