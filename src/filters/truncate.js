'use strict';

angular.module('openshiftCommonUI')
  .filter('truncate', function() {
    return function(str, charLimit, useWordBoundary, newlineLimit) {
      if (!str) {
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
        // Find the last word break, but don't look more than 10 characters back.
        // Make sure we show at least the first 5 characters.
        var startIndex = Math.max(4, charLimit - 10);
        var lastSpace = truncated.lastIndexOf(/\s/, startIndex);
        if (lastSpace !== -1) {
          truncated = truncated.substring(0, lastSpace);
        }
      }

      return truncated;
    };
  });
