'use strict';

angular.module('openshiftCommonUI')
  .filter("toArray", function() {
    return _.toArray;
  })
  .filter('size', function() {
    return _.size;
  })
  .filter('hashSize', function() {
    return function(hash) {
      if (!hash) {
        return 0;
      }
      return Object.keys(hash).length;
    };
  })
  // Wraps _.filter. Works with hashes, unlike ngFilter, which only works
  // with arrays.
  .filter('filterCollection', function() {
    return function(collection, predicate) {
      if (!collection || !predicate) {
        return collection;
      }
      return _.filter(collection, predicate);
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
  })
  .filter("getErrorDetails", function(upperFirstFilter) {
    return function(result, capitalize) {
      if (!result) {
        return "";
      }

      var error = result.data || {};
      if (error.message) {
        return capitalize ? upperFirstFilter(error.message) : error.message;
      }

      var status = result.status || error.status;
      if (status) {
        return "Status: " + status;
      }

      return "";
    };
  });
