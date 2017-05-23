'use strict';

angular.module('openshiftCommonUI')
  .directive('tileClick', function() {
    return {
      restrict: 'AC',
      link: function($scope, element) {
        $(element).click(function (evt) {
          var t = $(evt.target);
          if (t && t.closest("a", element).length) {
            return;
          }
          $('a.tile-target', element).trigger("click");
        });
      }
    };
  });
