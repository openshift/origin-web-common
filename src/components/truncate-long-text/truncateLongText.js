'use strict';

angular.module('openshiftCommonUI')
  // Truncates text to a length, adding a tooltip and an ellipsis if truncated.
  // Different than `text-overflow: ellipsis` because it allows for multiline text.
  .directive('truncateLongText', function(truncateFilter) {
    return {
      restrict: 'E',
      scope: {
        content: '=',
        limit: '=',
        newlineLimit: '=',
        useWordBoundary: '=',
        expandable: '=',
        // When expandable is on, optionally hide the collapse link so text can only be expanded. (Used for toast notifications.)
        hideCollapse: '=',
        keywords: '=highlightKeywords',  // optional keywords to highlight using the `highlightKeywords` filter
        prettifyJson: '='                // prettifies JSON blobs when expanded, only used if expandable is true
      },
      templateUrl: 'src/components/truncate-long-text/truncateLongText.html',
      link: function(scope) {
        scope.toggles = {expanded: false};
        scope.$watch('content', function(content) {
          if (content) {
            scope.truncatedContent = truncateFilter(content, scope.limit, scope.useWordBoundary, scope.newlineLimit);
            scope.truncated = scope.truncatedContent.length !== content.length;
          }
          else {
            scope.truncatedContent = null;
            scope.truncated = false;
          }
        });
      }
    };
  });
