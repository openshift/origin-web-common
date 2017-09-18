'use strict';

angular.module('openshiftCommonUI')
  .filter('preferredVersion', function(APIService) {
    return APIService.getPreferredVersion;
  });
