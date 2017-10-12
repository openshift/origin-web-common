'use strict';
angular.module('openshiftCommonUI')
  .filter('camelToLower', function() {
    return function(str) {
      if (!str) {
        return '';
      }

      // Use the special logic in _.startCase to handle camel case strings, kebab
      // case strings, snake case strings, etc.
      return _.startCase(str).toLowerCase();
    };
  })
  .filter('upperFirst', function() {
    // Uppercase the first letter of a string (without making any other changes).
    // Different than `capitalize` because it doesn't lowercase other letters.
    return _.upperFirst;
  })
  .filter('sentenceCase', function(camelToLowerFilter) {
    // Converts a camel case string to sentence case
    return function(str) {
      var lower = camelToLowerFilter(str);
      return _.upperFirst(lower);
    };
  })
  .filter('startCase', function () {
    return _.startCase;
  })
  .filter('capitalize', function() {
    return _.capitalize;
  })
  .filter('isMultiline', function() {
    return function(str, ignoreTrailing) {
      if (!str) {
        return false;
      }

      var index = str.search(/\r|\n/);
      if (index === -1) {
        return false;
      }

      // Ignore a final, trailing newline?
      if (ignoreTrailing) {
        return index !== (str.length - 1);
      }

      return true;
    };
  });
