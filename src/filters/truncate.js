'use strict';

angular.module('openshiftCommonUI')
  .filter('truncate', function() {
    return function(str, charLimit, useWordBoundary, newlineLimit) {
      if (typeof str !== 'string') {
        return str;
      }

      var truncated = str;

      if (charLimit) {
        truncated = truncated.substring(0, charLimit);
      }

      if (newlineLimit) {
        var nthNewline = str.split("\n", newlineLimit).join("\n").length;
        truncated = truncated.substring(0, nthNewline);
      }

      if (useWordBoundary !== false) {

        var startIndex = Math.max(4, charLimit - 10);
        var lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace >= startIndex && lastSpace !== -1) {
          truncated = truncated.substring(0, lastSpace);
        }
      }

      return truncated;
    };
  });
