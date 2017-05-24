'use strict';

angular.module('openshiftCommonUI')
  .directive('tileClick', function() {
    return {
      restrict: 'AC',
      link: function($scope, element) {
        $(element).click(function (evt) {
          // Don't trigger tile target if the user clicked directly on a link or button inside the tile.
          var t = $(evt.target);
          if (t && (t.closest("a", element).length || t.closest("button", element).length)) {
            return;
          }
          $('a.tile-target', element).trigger("click");
        });
      }
    };
  });
