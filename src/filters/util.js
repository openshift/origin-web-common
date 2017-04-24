'use strict';

angular.module('openshiftCommonUI')
  .filter("toArray", function() {
    return _.toArray;
  })
  .filter('size', function() {
    return _.size;
  })
  .filter('hashSize', function($log) {
    return function(hash) {
      if (!hash) {
        return 0;
      }
      return Object.keys(hash).length;
    };
  })
  .filter('generateName', function() {
    return function(prefix, length) {
      if (!prefix) {
        prefix = "";
      }
      if (!length) {
        length = 5;
      }
      var randomString = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
      return prefix + randomString;
    };
  });
